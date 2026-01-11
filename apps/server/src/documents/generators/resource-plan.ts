import { generateText } from "ai";
import { type ExtractedProjectData, getAIModel } from "../../ai";
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

	// Transform team data to resource format
	const team: ResourceTeamMember[] = (data.team || []).map((member) => ({
		role: member.role,
		roleLabel: member.roleLabel || ROLE_LABELS[member.role] || member.role,
		count: member.count || 1,
		seniorityLevel: member.seniorityLevel,
		allocationPercentage: member.allocationPercentage || 100,
		estimatedHours: member.estimatedHours,
		hourlyRate: member.hourlyRate,
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
		(sum, m) => sum + (m.estimatedCost || 0) * m.count,
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
