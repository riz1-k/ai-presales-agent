import { z } from "zod";

/**
 * Core Project Information
 */
export const ProjectInfoSchema = z.object({
	projectName: z.string().optional(),
	clientName: z.string().optional(),
	clientCompany: z.string().optional(),
	projectDescription: z.string().optional(),
	problemStatement: z.string().optional(),
	objectives: z.array(z.string()).optional(),
});

/**
 * Timeline and Budget Information
 */
export const TimelineBudgetSchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	durationWeeks: z.number().optional(),
	budgetMin: z.number().optional(),
	budgetMax: z.number().optional(),
	budgetCurrency: z.string().default("USD"),
	budgetNotes: z.string().optional(),
});

/**
 * Individual Deliverable
 */
export const DeliverableSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	estimatedHours: z.number().optional(),
	priority: z.enum(["high", "medium", "low"]).optional(),
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
export const TeamMemberSchema = z.object({
	role: SoftwareRoleEnum,
	roleLabel: z.string().optional(), // Human-readable label
	count: z.number().default(1),
	seniorityLevel: z.enum(["junior", "mid", "senior", "lead"]).optional(),
	allocationPercentage: z.number().min(0).max(100).default(100), // % of time allocated
	estimatedHours: z.number().optional(),
	hourlyRate: z.number().optional(), // For budget estimation
});

/**
 * Technical Requirements
 */
export const TechnicalRequirementsSchema = z.object({
	technologies: z.array(z.string()).optional(),
	integrations: z.array(z.string()).optional(),
	platforms: z.array(z.string()).optional(),
	constraints: z.array(z.string()).optional(),
	securityRequirements: z.array(z.string()).optional(),
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

