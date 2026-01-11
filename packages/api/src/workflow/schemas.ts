import { z } from "zod";

// ============================================================================
// PROJECT STATUS
// ============================================================================

export const ProjectStatusSchema = z.enum([
	"draft", // Active editing via chat
	"pending_approval", // Submitted for review
	"changes_requested", // Reviewer requested changes
	"approved", // Approved, awaiting finalization
	"finalized", // Locked, cannot edit
	"archived", // Completed/closed
]);

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// ============================================================================
// APPROVAL STATUS
// ============================================================================

export const ApprovalStatusSchema = z.enum([
	"pending",
	"approved",
	"rejected",
	"changes_requested",
]);

export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;

// ============================================================================
// APPROVAL RECORD
// ============================================================================

export const ApprovalRecordSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	approverId: z.string(),
	approverName: z.string(),
	status: ApprovalStatusSchema,
	comments: z.string().optional(),
	requestedChanges: z.array(z.string()).optional(),
	createdAt: z.date(),
	updatedAt: z.date().optional(),
});

export type ApprovalRecord = z.infer<typeof ApprovalRecordSchema>;

// ============================================================================
// WORKFLOW VALIDATION
// ============================================================================

export const ValidationResultSchema = z.object({
	valid: z.boolean(),
	errors: z.array(z.string()),
	warnings: z.array(z.string()),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

export const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
	draft: ["pending_approval", "archived"],
	pending_approval: ["approved", "changes_requested", "draft"],
	changes_requested: ["pending_approval", "draft", "archived"],
	approved: ["finalized", "changes_requested"],
	finalized: ["archived"],
	archived: ["draft"], // Reopen
};

export function canTransition(
	from: ProjectStatus,
	to: ProjectStatus,
): boolean {
	return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAvailableTransitions(
	status: ProjectStatus,
): ProjectStatus[] {
	return VALID_TRANSITIONS[status] || [];
}

// ============================================================================
// STATUS METADATA
// ============================================================================

export const STATUS_METADATA: Record<
	ProjectStatus,
	{
		label: string;
		color: string;
		description: string;
		canEdit: boolean;
		canChat: boolean;
	}
> = {
	draft: {
		label: "Draft",
		color: "gray",
		description: "Project is being actively edited",
		canEdit: true,
		canChat: true,
	},
	pending_approval: {
		label: "Pending Approval",
		color: "yellow",
		description: "Awaiting review from approver",
		canEdit: false,
		canChat: false,
	},
	changes_requested: {
		label: "Changes Requested",
		color: "orange",
		description: "Reviewer has requested changes",
		canEdit: true,
		canChat: true,
	},
	approved: {
		label: "Approved",
		color: "green",
		description: "Approved and ready for finalization",
		canEdit: false,
		canChat: false,
	},
	finalized: {
		label: "Finalized",
		color: "blue",
		description: "Project is finalized and locked",
		canEdit: false,
		canChat: false,
	},
	archived: {
		label: "Archived",
		color: "gray",
		description: "Project is archived",
		canEdit: false,
		canChat: false,
	},
};
