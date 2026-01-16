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
import { and, asc, eq } from "drizzle-orm";
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

interface MessagePart {
	type: string;
	text?: string;
}

interface UIMessage {
	role: string;
	content?: string;
	parts?: MessagePart[];
}

/**
 * Extract text content from a UI message (handles string content or parts)
 */
function getMessageText(message: UIMessage): string {
	if (typeof message.content === "string" && message.content.length > 0) {
		return message.content;
	}
	if (Array.isArray(message.parts)) {
		return message.parts
			.map((part: MessagePart) => (part.type === "text" ? part.text : ""))
			.join("");
	}
	return "";
}

/**
 * Clean messages to remove reasoning items and other incompatible structures
 * This fixes OpenAI API errors about reasoning items missing required following items
 */
function cleanMessagesForAPI(messages: UIMessage[]): UIMessage[] {
	return messages
		.map((msg) => {
			// Create a clean message object, explicitly only including allowed properties
			// This prevents any reasoning, id, or other properties from being passed through
			const cleanMsg: UIMessage = {
				role: msg.role,
			};

			// If message has parts, filter out reasoning items and keep only text parts
			if (Array.isArray(msg.parts)) {
				const textParts = msg.parts.filter(
					(part: MessagePart) => part.type === "text" && part.text,
				);
				if (textParts.length > 0) {
					// Return message with only text parts, no reasoning items
					cleanMsg.parts = textParts.map((part) => ({
						type: "text",
						text: part.text || "",
					}));
					cleanMsg.content = textParts
						.map((part: MessagePart) => part.text || "")
						.join("");
				} else {
					// If no text parts, return message with empty content
					cleanMsg.parts = [];
					cleanMsg.content = "";
				}
			} else if (typeof msg.content === "string") {
				// If message has string content, use it directly
				cleanMsg.content = msg.content;
			}

			return cleanMsg;
		})
		.filter((msg) => {
			// Remove messages with no content
			if (typeof msg.content === "string") {
				return msg.content.length > 0;
			}
			if (Array.isArray(msg.parts)) {
				return msg.parts.length > 0;
			}
			return false;
		});
}

/**
 * Save messages to database
 */
async function saveMessages(projectId: string, messages: UIMessage[]) {
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
		where: and(
			eq(projectData.projectId, projectId),
			eq(projectData.fieldName, "extractedData"),
		),
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
		where: and(
			eq(projectData.projectId, projectId),
			eq(projectData.fieldName, "extractedData"),
		),
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
		console.log(`[Extraction] Starting for project ${projectId}`);

		// Load conversation history
		const history = await loadConversationHistory(projectId);
		console.log(
			`[Extraction] Loaded ${history.length} messages for project ${projectId}`,
		);

		if (history.length === 0) {
			console.log(
				`[Extraction] No history found for project ${projectId}, skipping`,
			);
			return;
		}

		// Load existing extracted data
		const existingData = await loadExtractedData(projectId);
		console.log(
			`[Extraction] Existing data for project ${projectId}:`,
			existingData ? "found" : "none",
		);

		// Run extraction
		const result = await extractProjectData(history, existingData);
		console.log(
			`[Extraction] Result for project ${projectId}: success=${result.success}, changedFields=${result.changedFields.length}`,
		);

		if (result.success) {
			// Always save if extraction succeeded - this ensures first extraction is saved
			// even if changedFields is empty (comparing to undefined existing data)
			const hasData = Object.keys(result.updatedData).length > 0;
			if (hasData) {
				await saveExtractedData(projectId, result.updatedData);
				console.log(
					`[Extraction] Project ${projectId}: Saved extracted data. Changed fields: ${result.changedFields.join(", ") || "(initial extraction)"}`,
				);
			}
		} else {
			console.error(
				`[Extraction] Extraction failed for project ${projectId}:`,
				result.error,
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
		// Get the last user message to save
		const lastUserMessage = uiMessages
			.filter((m: { role: string }) => m.role === "user")
			.pop();

		if (lastUserMessage) {
			await saveMessages(projectId, [lastUserMessage]);
			// Run extraction right after user message is saved to start extraction immediately
			runExtractionBackground(projectId).catch((err) => {
				console.error("[Extraction] Pre-stream background error:", err);
			});
		}
	}

	// Clean messages to remove reasoning items that cause OpenAI API errors
	const cleanedMessages = cleanMessagesForAPI(uiMessages);

	// Additional safety: ensure no reasoning properties exist before conversion
	// This prevents OpenAI API errors about missing reasoning items
	const sanitizedMessages: UIMessage[] = cleanedMessages.map((msg) => {
		const sanitized: UIMessage = { role: msg.role };
		if (msg.content) sanitized.content = msg.content;
		if (msg.parts) sanitized.parts = msg.parts;
		// Explicitly exclude any reasoning-related properties
		return sanitized;
	});

	const result = streamText({
		model: getAIModel(),
		system: systemPrompt,
		messages: await convertToModelMessages(
			sanitizedMessages as Parameters<typeof convertToModelMessages>[0],
		),
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

// Explicit Bun.serve with really huge timeout (1 year in seconds)
Bun.serve({
	fetch: app.fetch,
	port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
	idleTimeout: 255,
});
