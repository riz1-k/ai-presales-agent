import { createContext } from "@ai-presales-agent/api/context";
import { appRouter } from "@ai-presales-agent/api/routers/index";
import { auth } from "@ai-presales-agent/auth";
import {
	conversations,
	db,
	projectData,
	projects,
} from "@ai-presales-agent/db";
import { env } from "@ai-presales-agent/env/server";
import { trpcServer } from "@hono/trpc-server";
import { convertToModelMessages, streamText } from "ai";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
	AI_CONFIG,
	type ExtractedProjectData,
	extractProjectData,
	getAIModel,
	type ProjectData,
	SYSTEM_PROMPTS,
} from "./ai";
import {
	generateAllDocuments,
	getLatestSnapshot,
	saveSnapshot,
} from "./documents/document-service";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

/**
 * Load project context from database
 */
async function loadProjectContext(
	projectId: string,
): Promise<ProjectData | null> {
	const project = await db.query.projects.findFirst({
		where: eq(projects.id, projectId),
	});

	if (!project) return null;

	const data = await db.query.projectData.findMany({
		where: eq(projectData.projectId, projectId),
	});

	const fields: Record<string, string> = {};
	for (const field of data) {
		fields[field.fieldName] = field.fieldValue;
	}

	return {
		projectName: project.projectName,
		status: project.status,
		fields,
	};
}

/**
 * Load conversation history from database
 */
async function loadConversationHistory(
	projectId: string,
	limit: number = AI_CONFIG.maxHistoryMessages,
) {
	const messages = await db.query.conversations.findMany({
		where: eq(conversations.projectId, projectId),
		orderBy: [asc(conversations.createdAt)],
		limit,
	});

	return messages.map((msg) => ({
		role: msg.role as "user" | "assistant" | "system",
		content: msg.content,
	}));
}

/**
 * Extract text content from a UI message (handles string content or parts)
 */
function getMessageText(message: any): string {
	if (typeof message.content === "string" && message.content.length > 0) {
		return message.content;
	}
	if (Array.isArray(message.parts)) {
		return message.parts
			.map((part: any) => (part.type === "text" ? part.text : ""))
			.join("");
	}
	return "";
}

/**
 * Save messages to database
 */
async function saveMessages(
	projectId: string,
	messages: Array<{ role: string; content?: string; parts?: any[] }>,
) {
	for (const msg of messages) {
		const text = getMessageText(msg);

		// Don't save empty messages
		if (!text) continue;

		await db.insert(conversations).values({
			id: crypto.randomUUID(),
			projectId,
			role: msg.role as "user" | "assistant" | "system",
			content: text,
		});
	}
}

/**
 * Load previously extracted project data from database
 */
async function loadExtractedData(
	projectId: string,
): Promise<ExtractedProjectData | undefined> {
	const data = await db.query.projectData.findFirst({
		where: eq(projectData.projectId, projectId),
	});

	if (!data || !data.fieldValue) return undefined;

	try {
		return JSON.parse(data.fieldValue) as ExtractedProjectData;
	} catch {
		return undefined;
	}
}

/**
 * Save extracted project data to database
 */
async function saveExtractedData(
	projectId: string,
	extractedData: ExtractedProjectData,
): Promise<void> {
	const existing = await db.query.projectData.findFirst({
		where: eq(projectData.projectId, projectId),
	});

	const jsonValue = JSON.stringify(extractedData);

	if (existing) {
		await db
			.update(projectData)
			.set({
				fieldValue: jsonValue,
				updatedAt: new Date(),
			})
			.where(eq(projectData.id, existing.id));
	} else {
		await db.insert(projectData).values({
			id: crypto.randomUUID(),
			projectId,
			fieldName: "extractedData",
			fieldValue: jsonValue,
		});
	}
}

/**
 * Run extraction in the background (non-blocking)
 */
async function runExtractionBackground(projectId: string): Promise<void> {
	try {
		// Load conversation history
		const history = await loadConversationHistory(projectId);
		if (history.length === 0) return;

		// Load existing extracted data
		const existingData = await loadExtractedData(projectId);

		// Run extraction
		const result = await extractProjectData(history, existingData);

		if (result.success && result.changedFields.length > 0) {
			// Save updated data
			await saveExtractedData(projectId, result.updatedData);
			console.log(
				`[Extraction] Project ${projectId}: Updated fields: ${result.changedFields.join(", ")}`,
			);
		}
	} catch (error) {
		console.error(`[Extraction] Failed for project ${projectId}:`, error);
	}
}

/**
 * AI endpoint - handles both general and project-scoped conversations
 */
app.post("/ai", async (c) => {
	const body = await c.req.json();
	const uiMessages = body.messages || [];
	const projectId = body.projectId as string | undefined;

	let systemPrompt = SYSTEM_PROMPTS.presalesAgent;

	// If project ID provided, load context and enhance system prompt
	if (projectId) {
		const projectContext = await loadProjectContext(projectId);
		if (projectContext) {
			systemPrompt = SYSTEM_PROMPTS.withContext(projectContext);
		}

		// Get the last user message to save
		const lastUserMessage = uiMessages
			.filter((m: { role: string }) => m.role === "user")
			.pop();
		if (lastUserMessage) {
			await saveMessages(projectId, [lastUserMessage]);
		}
	}

	const result = streamText({
		model: getAIModel(),
		system: systemPrompt,
		messages: await convertToModelMessages(uiMessages),
		temperature: AI_CONFIG.temperature,
		maxOutputTokens: AI_CONFIG.maxTokens,
		onFinish: async ({ text }) => {
			// Save assistant response to database if project-scoped
			if (projectId && text) {
				await saveMessages(projectId, [{ role: "assistant", content: text }]);

				// Run extraction in the background (non-blocking)
				// We don't await this to avoid blocking the response
				runExtractionBackground(projectId).catch((err) => {
					console.error("[Extraction] Background error:", err);
				});
			}
		},
	});

	return result.toUIMessageStreamResponse();
});

/**
 * Get conversation history for a project
 */
app.get("/ai/history/:projectId", async (c) => {
	const projectId = c.req.param("projectId");
	const history = await loadConversationHistory(projectId);
	return c.json({ messages: history });
});

/**
 * Get extracted project data
 */
app.get("/ai/extracted/:projectId", async (c) => {
	const projectId = c.req.param("projectId");
	const extractedData = await loadExtractedData(projectId);
	return c.json({ data: extractedData || null });
});

/**
 * Manually trigger extraction for a project
 */
app.post("/ai/extract/:projectId", async (c) => {
	const projectId = c.req.param("projectId");
	await runExtractionBackground(projectId);
	const extractedData = await loadExtractedData(projectId);
	return c.json({ data: extractedData || null });
});

/**
 * Trigger full document generation for a project
 */
app.post("/ai/generate-docs/:projectId", async (c) => {
	const projectId = c.req.param("projectId");
	const extractedData = await loadExtractedData(projectId);

	if (!extractedData) {
		return c.json({ error: "No extracted data found" }, 404);
	}

	try {
		const documents = await generateAllDocuments(projectId, extractedData);
		await saveSnapshot(projectId, documents);
		return c.json({ documents });
	} catch (error) {
		console.error("[Documents] Generation failed:", error);
		return c.json({ error: "Failed to generate documents" }, 500);
	}
});

/**
 * Get the latest snapshots for a project
 */
app.get("/ai/snapshots/latest/:projectId", async (c) => {
	const projectId = c.req.param("projectId");
	const snapshots = await getLatestSnapshot(projectId);
	return c.json({ documents: snapshots });
});

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
