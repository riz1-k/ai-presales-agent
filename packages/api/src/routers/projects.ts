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

	// Bulk update project data with changelog tracking
	updateProjectData: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
				changes: z.record(z.string(), z.string()),
				changeSource: z
					.enum(["ai_extraction", "manual_edit", "system"])
					.default("manual_edit"),
				createVersion: z.boolean().default(false),
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

			// Create version snapshot if requested
			if (input.createVersion) {
				const { versionManager } = await import("../services/version-manager");
				await versionManager.createVersion(
					input.projectId,
					`Bulk update: ${Object.keys(input.changes).length} fields`,
				);
			}

			// Get existing data
			const existingData = await db.query.projectData.findMany({
				where: eq(projectData.projectId, input.projectId),
			});

			const existingMap = new Map(existingData.map((d) => [d.fieldName, d]));

			// Process each change
			const { versionManager } = await import("../services/version-manager");

			for (const [fieldName, fieldValue] of Object.entries(input.changes)) {
				const existing = existingMap.get(fieldName);

				if (existing) {
					// Log the change
					await versionManager.logChange(
						input.projectId,
						fieldName,
						existing.fieldValue,
						fieldValue,
						input.changeSource,
					);

					// Update the field
					await db
						.update(projectData)
						.set({ fieldValue })
						.where(eq(projectData.id, existing.id));
				} else {
					// Log the addition
					await versionManager.logChange(
						input.projectId,
						fieldName,
						null,
						fieldValue,
						input.changeSource,
					);

					// Insert new field
					await db.insert(projectData).values({
						id: generateId(),
						projectId: input.projectId,
						fieldName,
						fieldValue,
					});
				}
			}

			// Update project's updatedAt
			await db
				.update(projects)
				.set({ updatedAt: new Date() })
				.where(eq(projects.id, input.projectId));

			return { success: true };
		}),

	// Duplicate a project
	duplicate: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
				with: {
					projectData: true,
				},
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			// Create new project
			const newProjectId = generateId();
			await db.insert(projects).values({
				id: newProjectId,
				userId: ctx.session.user.id,
				projectName: `${project.projectName} (Copy)`,
				status: "draft",
			});

			// Copy project data
			if (project.projectData.length > 0) {
				const dataToCopy = project.projectData.map((d) => ({
					id: generateId(),
					projectId: newProjectId,
					fieldName: d.fieldName,
					fieldValue: d.fieldValue,
				}));

				await db.insert(projectData).values(dataToCopy);
			}

			return { id: newProjectId };
		}),

	// Create a version snapshot
	createVersion: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
				changeSummary: z.string().optional(),
				completenessScore: z.number().min(0).max(100).optional(),
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

			const { versionManager } = await import("../services/version-manager");
			const versionId = await versionManager.createVersion(
				input.projectId,
				input.changeSummary,
				input.completenessScore,
			);

			return { versionId };
		}),

	// Get all versions for a project
	getVersions: protectedProcedure
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

			const { versionManager } = await import("../services/version-manager");
			return await versionManager.getVersions(input.projectId);
		}),

	// Restore a version
	restoreVersion: protectedProcedure
		.input(z.object({ versionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { versionManager } = await import("../services/version-manager");

			// Get the version to verify project ownership
			const version = await versionManager.getVersion(input.versionId);
			if (!version) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Version not found",
				});
			}

			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, version.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			await versionManager.restoreVersion(input.versionId);
			return { success: true };
		}),

	// Get changelog for a project
	getChangelog: protectedProcedure
		.input(
			z.object({
				projectId: z.string(),
				limit: z.number().min(1).max(200).optional().default(100),
			}),
		)
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

			const { versionManager } = await import("../services/version-manager");
			return await versionManager.getChangelog(input.projectId, input.limit);
		}),
});
