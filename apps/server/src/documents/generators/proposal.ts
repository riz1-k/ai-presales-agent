import { generateText } from "ai";
import { type ExtractedProjectData, getAIModel } from "../../ai";
import type { DocumentSection, ProposalDocument } from "../types";

/**
 * Generate a full proposal document using AI to expand on extracted project data
 */
export async function generateProposal(
	_projectId: string,
	data: ExtractedProjectData,
): Promise<ProposalDocument> {
	const model = getAIModel();

	// Generate Executive Summary
	const execSummaryResult = await generateText({
		model,
		system:
			"You are an expert presales consultant. Write a professional executive summary for a project proposal based on the provided project data. Keep it concise, compelling, and focused on value delivery.",
		prompt: `Project Data:\n${JSON.stringify(data.info, null, 2)}\n\nWrite a 2-3 paragraph executive summary.`,
	});

	// Generate Scope description if missing or generic
	const scopeResult = await generateText({
		model,
		system:
			"You are an expert presales consultant. Describe the scope of work for this project based on the deliverables and technical requirements. Be specific about what is included.",
		prompt: `Project Data:\nInfo: ${JSON.stringify(data.info)}\nDeliverables: ${JSON.stringify(data.deliverables)}\nTechnical: ${JSON.stringify(data.technical)}\n\nWrite a professional 'Scope of Work' section.`,
	});

	const sections: DocumentSection[] = [
		{
			id: "executive-summary",
			title: "Executive Summary",
			content: execSummaryResult.text,
			isAIGenerated: true,
		},
		{
			id: "objectives",
			title: "Project Objectives",
			content:
				data.info?.objectives?.map((o) => `- ${o}`).join("\n") ||
				"No objectives specified yet.",
			isAIGenerated: false,
		},
		{
			id: "scope",
			title: "Scope of Work",
			content: scopeResult.text,
			isAIGenerated: true,
		},
		{
			id: "deliverables",
			title: "Key Deliverables",
			content:
				data.deliverables
					?.map((d) => `### ${d.name}\n${d.description || ""}`)
					.join("\n\n") || "No deliverables specified yet.",
			isAIGenerated: false,
		},
		{
			id: "investment",
			title: "Investment & Timeline",
			content: `Estimated Duration: ${data.timelineBudget?.durationWeeks || "TBD"} weeks\nEstimated Budget: ${data.timelineBudget?.budgetCurrency || "USD"} ${data.timelineBudget?.budgetMin || "TBD"}${data.timelineBudget?.budgetMax ? ` - ${data.timelineBudget.budgetMax}` : ""}\n\nNotes: ${data.timelineBudget?.budgetNotes || "None"}`,
			isAIGenerated: false,
		},
	];

	return {
		title: data.info?.projectName || "Project Proposal",
		generatedAt: new Date(),
		sections,
	};
}
