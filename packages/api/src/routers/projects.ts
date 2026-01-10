import { db, projectData, projects } from "@ai-presales-agent/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

// Generate unique ID (using crypto.randomUUID for simplicity)
const generateId = () => crypto.randomUUID();

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const createProjectSchema = z.object({
	projectName: z.string().min(1).max(255),
});

const updateProjectSchema = z.object({
	projectId: z.string(),
	projectName: z.string().min(1).max(255).optional(),
	status: z
		.enum(["draft", "pending_approval", "approved", "finalized"])
		.optional(),
});

const updateProjectDataSchema = z.object({
	projectId: z.string(),
	fieldName: z.string().min(1),
	fieldValue: z.string(), // JSON stringified for complex values
});

// ============================================================================
// PROJECTS ROUTER
// ============================================================================

export const projectsRouter = router({
	// List all projects for the current user
	list: protectedProcedure.query(async ({ ctx }) => {
		const userProjects = await db.query.projects.findMany({
			where: eq(projects.userId, ctx.session.user.id),
			orderBy: [desc(projects.updatedAt)],
		});
		return userProjects;
	}),

	// Get a single project by ID
	getById: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ ctx, input }) => {
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
				with: {
					projectData: true,
					conversations: {
						orderBy: (conversations, { asc }) => [asc(conversations.createdAt)],
					},
					documentSnapshots: {
						orderBy: (documentSnapshots, { desc }) => [
							desc(documentSnapshots.version),
						],
					},
					approvals: {
						orderBy: (approvals, { desc }) => [desc(approvals.createdAt)],
					},
				},
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			return project;
		}),

	// Create a new project
	create: protectedProcedure
		.input(createProjectSchema)
		.mutation(async ({ ctx, input }) => {
			const id = generateId();
			await db.insert(projects).values({
				id,
				userId: ctx.session.user.id,
				projectName: input.projectName,
				status: "draft",
			});

			return { id };
		}),

	// Update a project
	update: protectedProcedure
		.input(updateProjectSchema)
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const existing = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			await db
				.update(projects)
				.set({
					...(input.projectName && { projectName: input.projectName }),
					...(input.status && { status: input.status }),
				})
				.where(eq(projects.id, input.projectId));

			return { success: true };
		}),

	// Delete a project
	delete: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify ownership
			const existing = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			await db.delete(projects).where(eq(projects.id, input.projectId));
			return { success: true };
		}),

	// Update or create project data field
	setData: protectedProcedure
		.input(updateProjectDataSchema)
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

			// Check if field already exists
			const existingField = await db.query.projectData.findFirst({
				where: and(
					eq(projectData.projectId, input.projectId),
					eq(projectData.fieldName, input.fieldName),
				),
			});

			if (existingField) {
				await db
					.update(projectData)
					.set({ fieldValue: input.fieldValue })
					.where(eq(projectData.id, existingField.id));
			} else {
				await db.insert(projectData).values({
					id: generateId(),
					projectId: input.projectId,
					fieldName: input.fieldName,
					fieldValue: input.fieldValue,
				});
			}

			return { success: true };
		}),

	// Get all project data for a project
	getData: protectedProcedure
		.input(z.object({ projectId: z.string() }))
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

			const data = await db.query.projectData.findMany({
				where: eq(projectData.projectId, input.projectId),
			});

			return data;
		}),
});
