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
import { AI_CONFIG, getAIModel, type ProjectData, SYSTEM_PROMPTS } from "./ai";

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
 * Save messages to database
 */
async function saveMessages(
	projectId: string,
	messages: Array<{ role: string; content: string }>,
) {
	for (const msg of messages) {
		await db.insert(conversations).values({
			id: crypto.randomUUID(),
			projectId,
			role: msg.role as "user" | "assistant" | "system",
			content: msg.content,
		});
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
			await saveMessages(projectId, [
				{ role: "user", content: lastUserMessage.content },
			]);
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

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
