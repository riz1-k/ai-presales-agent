import { approvals, db, projects } from "@ai-presales-agent/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

// Generate unique ID
const generateId = () => crypto.randomUUID();

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const createApprovalSchema = z.object({
	projectId: z.string(),
});

const updateApprovalSchema = z.object({
	approvalId: z.string(),
	status: z.enum(["pending", "approved", "rejected", "changes_requested"]),
	comments: z.string().optional(),
});

// ============================================================================
// APPROVALS ROUTER
// ============================================================================

export const approvalsRouter = router({
	// Request approval for a project (creates a pending approval)
	requestApproval: protectedProcedure
		.input(createApprovalSchema)
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

			// Check if there's already a pending approval
			const existingPending = await db.query.approvals.findFirst({
				where: and(
					eq(approvals.projectId, input.projectId),
					eq(approvals.status, "pending"),
				),
			});

			if (existingPending) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Project already has a pending approval request",
				});
			}

			// Update project status
			await db
				.update(projects)
				.set({ status: "pending_approval" })
				.where(eq(projects.id, input.projectId));

			// Create approval record (approver will be set when someone reviews)
			const id = generateId();
			await db.insert(approvals).values({
				id,
				projectId: input.projectId,
				approverId: ctx.session.user.id, // Initially set to requester
				status: "pending",
			});

			return { id };
		}),

	// Update approval status (for approvers)
	updateApproval: protectedProcedure
		.input(updateApprovalSchema)
		.mutation(async ({ ctx, input }) => {
			// Get the approval
			const approval = await db.query.approvals.findFirst({
				where: eq(approvals.id, input.approvalId),
				with: {
					project: true,
				},
			});

			if (!approval) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Approval not found",
				});
			}

			// Update approval
			await db
				.update(approvals)
				.set({
					status: input.status,
					comments: input.comments,
					approverId: ctx.session.user.id, // Record who made the decision
				})
				.where(eq(approvals.id, input.approvalId));

			// Update project status based on approval decision
			let newProjectStatus:
				| "draft"
				| "pending_approval"
				| "approved"
				| "finalized" = "draft";
			if (input.status === "approved") {
				newProjectStatus = "approved";
			} else if (
				input.status === "rejected" ||
				input.status === "changes_requested"
			) {
				newProjectStatus = "draft"; // Return to draft for revisions
			}

			await db
				.update(projects)
				.set({ status: newProjectStatus })
				.where(eq(projects.id, approval.projectId));

			return { success: true };
		}),

	// Get all approvals for a project
	getByProject: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ input }) => {
			// Verify project ownership or approver access
			const project = await db.query.projects.findFirst({
				where: eq(projects.id, input.projectId),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const projectApprovals = await db.query.approvals.findMany({
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

			return projectApprovals;
		}),

	// Get pending approvals (for approvers to see what needs review)
	getPending: protectedProcedure.query(async () => {
		const pendingApprovals = await db.query.approvals.findMany({
			where: eq(approvals.status, "pending"),
			orderBy: [desc(approvals.createdAt)],
			with: {
				project: {
					columns: {
						id: true,
						projectName: true,
						status: true,
						createdAt: true,
					},
				},
			},
		});

		return pendingApprovals;
	}),

	// Finalize a project (after approval)
	finalizeProject: protectedProcedure
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

			if (project.status !== "approved") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Can only finalize approved projects",
				});
			}

			await db
				.update(projects)
				.set({ status: "finalized" })
				.where(eq(projects.id, input.projectId));

			return { success: true };
		}),
});
