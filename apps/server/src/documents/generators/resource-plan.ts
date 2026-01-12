import { generateObject, generateText } from "ai";
import { z } from "zod";
import {
	type ExtractedProjectData,
	getAIModel,
	TeamMemberSchema,
} from "../../ai";
import type { ResourceDocument, ResourceTeamMember } from "../types";

/**
 * Role labels for display
 */
const ROLE_LABELS: Record<string, string> = {
	project_manager: "Project Manager",
	tech_lead: "Tech Lead",
	frontend_developer: "Frontend Developer",
	backend_developer: "Backend Developer",
	fullstack_developer: "Full Stack Developer",
	devops_engineer: "DevOps Engineer",
	qa_engineer: "QA Engineer",
	ui_ux_designer: "UI/UX Designer",
	business_analyst: "Business Analyst",
	scrum_master: "Scrum Master",
};

/**
 * Generate a resource plan document
 */
export async function generateResourcePlan(
	_projectId: string,
	data: ExtractedProjectData,
): Promise<ResourceDocument> {
	const model = getAIModel();

	let teamData = data.team || [];

	// AI Fallback: If team is empty or very small, have AI recommend a full team
	if (teamData.length < 2) {
		// Create a schema with all fields required for OpenAI validation
		// OpenAI's structured output requires all properties to be in the required array
		// Note: Cannot use .default() as OpenAI requires all properties in required array
		const TeamMemberWithLabelSchema = z.object({
			role: TeamMemberSchema.shape.role,
			roleLabel: z.string(), // Required for OpenAI validation
			count: z.number(), // Required - no default, handle in mapping
			seniorityLevel: z.enum(["junior", "mid", "senior", "lead"]),
			allocationPercentage: z.number().min(0).max(100), // Required - no default, handle in mapping
			estimatedHours: z.number(),
			hourlyRate: z.number(),
		});

		const recommendation = await generateObject({
			model,
			schema: z.object({
				recommendedTeam: z.array(TeamMemberWithLabelSchema),
			}),
			system:
				"You are an expert project resource manager. Recommend an optimal team composition for this software project based on the scope, deliverables, and timeline. Ensure a balanced team (PM, Design, Dev, QA) that fits the budget and duration. For each team member, provide a role (from the enum), roleLabel (human-readable name like 'Project Manager' or 'Frontend Developer'), count, seniorityLevel, allocationPercentage, estimatedHours, and hourlyRate.",
			prompt: `Project: ${data.info?.projectName}\nDescription: ${data.info?.projectDescription}\nTimeline: ${data.timelineBudget?.durationWeeks} weeks\nBudget: ${data.timelineBudget?.budgetMin} - ${data.timelineBudget?.budgetMax}\nDeliverables: ${JSON.stringify(data.deliverables)}\nExisting Team: ${JSON.stringify(teamData)}\n\nRecommend a full team composition. If an existing team is provided, complement it with missing roles.`,
		});

		// Merge recommended team with existing: keep existing roles, add new ones from recommendation
		const existingRoles = new Set(teamData.map((m) => m.role));
		const newMembers = recommendation.object.recommendedTeam
			.filter((m) => !existingRoles.has(m.role))
			.map((m) => ({
				role: m.role,
				roleLabel: m.roleLabel,
				count: m.count || 1, // Handle default here
				seniorityLevel: m.seniorityLevel || undefined,
				allocationPercentage: m.allocationPercentage || 100, // Handle default here
				estimatedHours: m.estimatedHours > 0 ? m.estimatedHours : undefined,
				hourlyRate: m.hourlyRate > 0 ? m.hourlyRate : undefined,
			}));
		teamData = [...teamData, ...newMembers];
	}

	// Transform team data to resource format
	const team: ResourceTeamMember[] = teamData.map((member) => ({
		role: member.role,
		roleLabel: member.roleLabel || ROLE_LABELS[member.role] || member.role,
		count: member.count || 1,
		seniorityLevel: member.seniorityLevel || undefined,
		allocationPercentage: member.allocationPercentage || 100,
		estimatedHours: member.estimatedHours || undefined,
		hourlyRate: member.hourlyRate || undefined,
		estimatedCost:
			member.estimatedHours && member.hourlyRate
				? member.estimatedHours * member.hourlyRate
				: undefined,
	}));

	// Calculate totals
	const totalHeadcount = team.reduce((sum, m) => sum + m.count, 0);
	const totalHours = team.reduce(
		(sum, m) => sum + (m.estimatedHours || 0) * m.count,
		0,
	);
	const estimatedCost = team.reduce(
		(sum, m) => sum + (m.estimatedCost || 0) * (m.count || 1),
		0,
	);

	// Generate a summary analysis of the team composition
	const summaryResult = await generateText({
		model,
		system:
			"You are a project resource manager. Analyze the team requirements for this project and explain why this composition is optimal for the delivered scope. Be concise but insightful.",
		prompt: `Project Scope: ${data.info?.projectDescription}\nTeam: ${JSON.stringify(team)}\nDeliverables: ${JSON.stringify(data.deliverables)}\nTotal Headcount: ${totalHeadcount}\nTotal Hours: ${totalHours}\n\nWrite a 1-2 paragraph resource strategy summary explaining this team composition.`,
	});

	return {
		title: `Resource Plan: ${data.info?.projectName || "New Project"}`,
		generatedAt: new Date(),
		summary: summaryResult.text,
		team,
		totalHours,
		totalHeadcount,
		estimatedCost: estimatedCost > 0 ? estimatedCost : undefined,
	};
}
