import { approvals, db, projects } from "@ai-presales-agent/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import {
	ProjectStatusSchema,
	canTransition,
} from "../workflow/schemas";
import {
	validateForApproval,
	validateForFinalization,
} from "../workflow/validation";

const generateId = () => crypto.randomUUID();

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const submitForApprovalSchema = z.object({
	projectId: z.string(),
	message: z.string().optional(),
});

const approveProjectSchema = z.object({
	projectId: z.string(),
	comments: z.string().optional(),
});

const requestChangesSchema = z.object({
	projectId: z.string(),
	comments: z.string(),
	requestedChanges: z.array(z.string()),
});

const rejectProjectSchema = z.object({
	projectId: z.string(),
	reason: z.string(),
});

const updateProjectStatusSchema = z.object({
	projectId: z.string(),
	status: ProjectStatusSchema,
});

// ============================================================================
// APPROVALS ROUTER
// ============================================================================

export const approvalsRouter = router({
	// Submit project for approval
	submitForApproval: protectedProcedure
		.input(submitForApprovalSchema)
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

			// Check if transition is valid
			if (!canTransition(project.status, "pending_approval")) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Cannot submit for approval from ${project.status} status`,
				});
			}

			// Validate project is ready for approval
			const validation = await validateForApproval(input.projectId);
			if (!validation.valid) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Project validation failed: ${validation.errors.join(", ")}`,
					cause: validation,
				});
			}

			// Update project status
			await db
				.update(projects)
				.set({ status: "pending_approval" })
				.where(eq(projects.id, input.projectId));

			// Create approval record
			const approvalId = generateId();
			await db.insert(approvals).values({
				id: approvalId,
				projectId: input.projectId,
				approverId: ctx.session.user.id, // TODO: Get actual approver from settings
				status: "pending",
				comments: input.message,
			});

			// TODO: Send notification to approvers

			return { success: true, approvalId, validation };
		}),

	// Approve a project
	approveProject: protectedProcedure
		.input(approveProjectSchema)
		.mutation(async ({ input }) => {
			// Get project
			const project = await db.query.projects.findFirst({
				where: eq(projects.id, input.projectId),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			if (project.status !== "pending_approval") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project is not pending approval",
				});
			}

			// Get the approval record
			const approval = await db.query.approvals.findFirst({
				where: and(
					eq(approvals.projectId, input.projectId),
					eq(approvals.status, "pending"),
				),
			});

			if (!approval) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Approval record not found",
				});
			}

			// Update approval record
			await db
				.update(approvals)
				.set({
					status: "approved",
					comments: input.comments,
					updatedAt: new Date(),
				})
				.where(eq(approvals.id, approval.id));

			// Update project status
			await db
				.update(projects)
				.set({ status: "approved" })
				.where(eq(projects.id, input.projectId));

			// TODO: Notify project owner

			return { success: true };
		}),

	// Request changes
	requestChanges: protectedProcedure
		.input(requestChangesSchema)
		.mutation(async ({ input }) => {
			// Get project
			const project = await db.query.projects.findFirst({
				where: eq(projects.id, input.projectId),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			if (project.status !== "pending_approval") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project is not pending approval",
				});
			}

			// Get the approval record
			const approval = await db.query.approvals.findFirst({
				where: and(
					eq(approvals.projectId, input.projectId),
					eq(approvals.status, "pending"),
				),
			});

			if (!approval) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Approval record not found",
				});
			}

			// Update approval record
			await db
				.update(approvals)
				.set({
					status: "changes_requested",
					comments: input.comments,
					requestedChanges: JSON.stringify(input.requestedChanges),
					updatedAt: new Date(),
				})
				.where(eq(approvals.id, approval.id));

			// Update project status
			await db
				.update(projects)
				.set({ status: "changes_requested" })
				.where(eq(projects.id, input.projectId));

			// TODO: Notify project owner

			return { success: true };
		}),

	// Reject project
	rejectProject: protectedProcedure
		.input(rejectProjectSchema)
		.mutation(async ({ input }) => {
			// Get project
			const project = await db.query.projects.findFirst({
				where: eq(projects.id, input.projectId),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			if (project.status !== "pending_approval") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project is not pending approval",
				});
			}

			// Get the approval record
			const approval = await db.query.approvals.findFirst({
				where: and(
					eq(approvals.projectId, input.projectId),
					eq(approvals.status, "pending"),
				),
			});

			if (!approval) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Approval record not found",
				});
			}

			// Update approval record
			await db
				.update(approvals)
				.set({
					status: "rejected",
					comments: input.reason,
					updatedAt: new Date(),
				})
				.where(eq(approvals.id, approval.id));

			// Update project status back to draft
			await db
				.update(projects)
				.set({ status: "draft" })
				.where(eq(projects.id, input.projectId));

			// TODO: Notify project owner

			return { success: true };
		}),

	// Finalize approved project
	finalizeProject: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Get project and verify ownership
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

			if (project.status !== "approved") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project must be approved before finalization",
				});
			}

			// Validate project is ready for finalization
			const validation = await validateForFinalization(input.projectId);
			if (!validation.valid) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Project validation failed: ${validation.errors.join(", ")}`,
					cause: validation,
				});
			}

			// Create final version snapshot
			const { versionManager } = await import("../services/version-manager");
			await versionManager.createVersion(
				input.projectId,
				"Final version before locking",
				100,
			);

			// Update project status
			await db
				.update(projects)
				.set({ status: "finalized" })
				.where(eq(projects.id, input.projectId));

			return { success: true, validation };
		}),

	// Update project status (admin/system use)
	updateStatus: protectedProcedure
		.input(updateProjectStatusSchema)
		.mutation(async ({ ctx, input }) => {
			// Get project and verify ownership
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

			// Check if transition is valid
			if (!canTransition(project.status, input.status)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Cannot transition from ${project.status} to ${input.status}`,
				});
			}

			// Update project status
			await db
				.update(projects)
				.set({ status: input.status })
				.where(eq(projects.id, input.projectId));

			return { success: true };
		}),

	// Get approval history for a project
	getApprovalHistory: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ ctx, input }) => {
			// Verify project access
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

			// Get all approvals for this project
			const approvalRecords = await db.query.approvals.findMany({
				where: eq(approvals.projectId, input.projectId),
				orderBy: [desc(approvals.createdAt)],
				with: {
					approver: {
						columns: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			return approvalRecords.map((approval) => ({
				...approval,
				requestedChanges: approval.requestedChanges
					? JSON.parse(approval.requestedChanges)
					: [],
			}));
		}),

	// Get projects pending approval (for approvers)
	getPendingApprovals: protectedProcedure.query(async () => {
		// Get all projects pending approval
		// TODO: Filter by approver role/permissions
		const pendingProjects = await db.query.projects.findMany({
			where: eq(projects.status, "pending_approval"),
			orderBy: [desc(projects.updatedAt)],
			with: {
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
				approvals: {
					where: eq(approvals.status, "pending"),
					orderBy: [desc(approvals.createdAt)],
					limit: 1,
				},
			},
		});

		return pendingProjects;
	}),

	// Validate project for approval
	validateProject: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ ctx, input }) => {
			// Verify project access
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

			return await validateForApproval(input.projectId);
		}),
});
