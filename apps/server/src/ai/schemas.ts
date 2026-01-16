import { z } from "zod";

/**
 * Core Project Information
 * Note: All fields are required in Zod (for OpenAI's response format requirement)
 * but can be null, which we transform to undefined for TypeScript compatibility
 */
export const ProjectInfoSchema = z
	.object({
		projectName: z.string().nullable(),
		clientName: z.string().nullable(),
		clientCompany: z.string().nullable(),
		projectDescription: z.string().nullable(),
		problemStatement: z.string().nullable(),
		objectives: z.array(z.string()).nullable(),
	})
	.transform((data) => {
		// Transform null to undefined for cleaner output
		return {
			projectName: data.projectName ?? undefined,
			clientName: data.clientName ?? undefined,
			clientCompany: data.clientCompany ?? undefined,
			projectDescription: data.projectDescription ?? undefined,
			problemStatement: data.problemStatement ?? undefined,
			objectives: data.objectives ?? undefined,
		};
	});

/**
 * Timeline and Budget Information
 */
export const TimelineBudgetSchema = z
	.object({
		startDate: z.string().nullable(),
		endDate: z.string().nullable(),
		durationWeeks: z.number().nullable(),
		budgetMin: z.number().nullable(),
		budgetMax: z.number().nullable(),
		budgetCurrency: z.string().default("USD"),
		budgetNotes: z.string().nullable(),
	})
	.transform((data) => {
		return {
			startDate: data.startDate ?? undefined,
			endDate: data.endDate ?? undefined,
			durationWeeks: data.durationWeeks ?? undefined,
			budgetMin: data.budgetMin ?? undefined,
			budgetMax: data.budgetMax ?? undefined,
			budgetCurrency: data.budgetCurrency,
			budgetNotes: data.budgetNotes ?? undefined,
		};
	});

/**
 * Individual Deliverable
 */
export const DeliverableSchema = z
	.object({
		name: z.string(),
		description: z.string().nullable(),
		estimatedHours: z.number().nullable(),
		priority: z.enum(["high", "medium", "low"]).nullable(),
	})
	.transform((data) => {
		return {
			name: data.name,
			description: data.description ?? undefined,
			estimatedHours: data.estimatedHours ?? undefined,
			priority: data.priority ?? undefined,
		};
	});

/**
 * Software development role types
 */
export const SoftwareRoleEnum = z.enum([
	"project_manager",
	"tech_lead",
	"frontend_developer",
	"backend_developer",
	"fullstack_developer",
	"devops_engineer",
	"qa_engineer",
	"ui_ux_designer",
	"business_analyst",
	"scrum_master",
]);

/**
 * Team Member Requirement
 */
export const TeamMemberSchema = z
	.object({
		role: SoftwareRoleEnum,
		roleLabel: z.string().nullable(), // Human-readable label
		count: z.number().default(1),
		seniorityLevel: z.enum(["junior", "mid", "senior", "lead"]).nullable(),
		allocationPercentage: z.number().min(0).max(100).default(100), // % of time allocated
		estimatedHours: z.number().nullable(),
		hourlyRate: z.number().nullable(), // For budget estimation
	})
	.transform((data) => {
		return {
			role: data.role,
			roleLabel: data.roleLabel ?? undefined,
			count: data.count,
			seniorityLevel: data.seniorityLevel ?? undefined,
			allocationPercentage: data.allocationPercentage,
			estimatedHours: data.estimatedHours ?? undefined,
			hourlyRate: data.hourlyRate ?? undefined,
		};
	});

/**
 * Technical Requirements
 */
export const TechnicalRequirementsSchema = z
	.object({
		technologies: z.array(z.string()).nullable(),
		integrations: z.array(z.string()).nullable(),
		platforms: z.array(z.string()).nullable(),
		constraints: z.array(z.string()).nullable(),
		securityRequirements: z.array(z.string()).nullable(),
	})
	.transform((data) => {
		return {
			technologies: data.technologies ?? undefined,
			integrations: data.integrations ?? undefined,
			platforms: data.platforms ?? undefined,
			constraints: data.constraints ?? undefined,
			securityRequirements: data.securityRequirements ?? undefined,
		};
	});

/**
 * Complete Project Data Object
 */
export const ExtractedProjectDataSchema = z.object({
	info: ProjectInfoSchema.optional(),
	timelineBudget: TimelineBudgetSchema.optional(),
	deliverables: z.array(DeliverableSchema).optional(),
	team: z.array(TeamMemberSchema).optional(),
	technical: TechnicalRequirementsSchema.optional(),
	risks: z.array(z.string()).optional(),
	assumptions: z.array(z.string()).optional(),
	outOfScope: z.array(z.string()).optional(),
});

// Type exports
export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;
export type TimelineBudget = z.infer<typeof TimelineBudgetSchema>;
export type Deliverable = z.infer<typeof DeliverableSchema>;
export type SoftwareRole = z.infer<typeof SoftwareRoleEnum>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type TechnicalRequirements = z.infer<typeof TechnicalRequirementsSchema>;
export type ExtractedProjectData = z.infer<typeof ExtractedProjectDataSchema>;
