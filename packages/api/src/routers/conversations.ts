import { conversations, db, projects } from "@ai-presales-agent/db";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

// Generate unique ID
const generateId = () => crypto.randomUUID();

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const addMessageSchema = z.object({
	projectId: z.string(),
	role: z.enum(["user", "assistant", "system"]),
	content: z.string().min(1),
	metadata: z.string().optional(), // JSON stringified
});

const getMessagesSchema = z.object({
	projectId: z.string(),
	limit: z.number().min(1).max(100).optional().default(50),
	offset: z.number().min(0).optional().default(0),
});

// ============================================================================
// CONVERSATIONS ROUTER
// ============================================================================

export const conversationsRouter = router({
	// Get all messages for a project
	getMessages: protectedProcedure
		.input(getMessagesSchema)
		.query(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const messages = await db.query.conversations.findMany({
				where: eq(conversations.projectId, input.projectId),
				orderBy: [asc(conversations.createdAt)],
				limit: input.limit,
				offset: input.offset,
			});

			return messages;
		}),

	// Add a new message to the conversation
	addMessage: protectedProcedure
		.input(addMessageSchema)
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const id = generateId();
			await db.insert(conversations).values({
				id,
				projectId: input.projectId,
				role: input.role,
				content: input.content,
				metadata: input.metadata,
			});

			return { id };
		}),

	// Add multiple messages at once (useful for bulk import)
	addMessages: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
				messages: z.array(
					z.object({
						role: z.enum(["user", "assistant", "system"]),
						content: z.string().min(1),
						metadata: z.string().optional(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const messagesToInsert = input.messages.map((msg) => ({
				id: generateId(),
				projectId: input.projectId,
				role: msg.role,
				content: msg.content,
				metadata: msg.metadata,
			}));

			await db.insert(conversations).values(messagesToInsert);

			return { count: messagesToInsert.length };
		}),

	// Clear all messages for a project
	clearMessages: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			await db
				.delete(conversations)
				.where(eq(conversations.projectId, input.projectId));

			return { success: true };
		}),
});
