import { db, projectData } from "@ai-presales-agent/db";
import { eq } from "drizzle-orm";
import type { ValidationResult } from "./schemas";

/**
 * Validate if a project is ready for approval submission
 */
export async function validateForApproval(
	projectId: string,
): Promise<ValidationResult> {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Get project data
	const data = await db.query.projectData.findMany({
		where: eq(projectData.projectId, projectId),
	});

	// Convert to map for easier access
	const dataMap = new Map(data.map((d) => [d.fieldName, d.fieldValue]));

	// Required fields validation
	const requiredFields = [
		{ key: "projectName", label: "Project Name" },
		{ key: "clientName", label: "Client Name" },
		{ key: "projectDescription", label: "Project Description" },
	];

	for (const field of requiredFields) {
		const value = dataMap.get(field.key);
		if (!value || value.trim() === "") {
			errors.push(`${field.label} is required`);
		}
	}

	// Recommended fields validation (warnings)
	const recommendedFields = [
		{ key: "projectObjectives", label: "Project Objectives" },
		{ key: "technicalRequirements", label: "Technical Requirements" },
		{ key: "timeline", label: "Timeline" },
		{ key: "budget", label: "Budget" },
	];

	for (const field of recommendedFields) {
		const value = dataMap.get(field.key);
		if (!value || value.trim() === "") {
			warnings.push(`${field.label} is recommended but not provided`);
		}
	}

	// Check for minimum data completeness
	if (data.length < 5) {
		warnings.push(
			"Project has limited data. Consider adding more details before submission.",
		);
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate if a project can be finalized
 */
export async function validateForFinalization(
	projectId: string,
): Promise<ValidationResult> {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Get project data
	const data = await db.query.projectData.findMany({
		where: eq(projectData.projectId, projectId),
	});

	const dataMap = new Map(data.map((d) => [d.fieldName, d.fieldValue]));

	// All critical fields must be present for finalization
	const criticalFields = [
		{ key: "projectName", label: "Project Name" },
		{ key: "clientName", label: "Client Name" },
		{ key: "projectDescription", label: "Project Description" },
		{ key: "projectObjectives", label: "Project Objectives" },
		{ key: "technicalRequirements", label: "Technical Requirements" },
		{ key: "deliverables", label: "Deliverables" },
		{ key: "timeline", label: "Timeline" },
	];

	for (const field of criticalFields) {
		const value = dataMap.get(field.key);
		if (!value || value.trim() === "") {
			errors.push(`${field.label} is required for finalization`);
		}
	}

	// Check for document generation
	const hasProposal = dataMap.get("hasProposal") === "true";
	const hasResourcePlan = dataMap.get("hasResourcePlan") === "true";
	const hasWBS = dataMap.get("hasWBS") === "true";

	if (!hasProposal) {
		warnings.push("Proposal document has not been generated");
	}
	if (!hasResourcePlan) {
		warnings.push("Resource plan has not been generated");
	}
	if (!hasWBS) {
		warnings.push("Work Breakdown Structure has not been generated");
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}
