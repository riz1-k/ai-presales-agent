export interface DocumentSection {
	id: string;
	title: string;
	content: string;
	isAIGenerated: boolean;
	lastEdited?: Date;
}

export interface ProposalDocument {
	title: string;
	generatedAt: Date;
	sections: DocumentSection[];
}

export interface ResourceTeamMember {
	role: string;
	roleLabel: string;
	count: number;
	seniorityLevel?: "junior" | "mid" | "senior" | "lead";
	allocationPercentage: number;
	estimatedHours?: number;
	hourlyRate?: number;
	estimatedCost?: number;
}

export interface ResourceDocument {
	title: string;
	generatedAt: Date;
	summary: string;
	team: ResourceTeamMember[];
	totalHours: number;
	totalHeadcount: number;
	estimatedCost?: number;
}

export interface WBSTask {
	id: string;
	name: string;
	description?: string;
	estimatedHours: number;
	priority?: "high" | "medium" | "low";
}

export interface WBSPhase {
	id: string;
	name: string;
	tasks: WBSTask[];
}

export interface WBSDocument {
	title: string;
	generatedAt: Date;
	phases: WBSPhase[];
}
