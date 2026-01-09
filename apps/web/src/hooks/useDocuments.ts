"use client";

import { env } from "@ai-presales-agent/env/web";
import { useCallback, useEffect, useState } from "react";

export interface DocumentSection {
	id: string;
	title: string;
	content: string;
	isAIGenerated: boolean;
	lastEdited?: string;
}

export interface ProposalDocument {
	title: string;
	generatedAt: string;
	sections: DocumentSection[];
}

export interface ResourceDocument {
	title: string;
	generatedAt: string;
	summary: string;
	totalHours: number;
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
	generatedAt: string;
	phases: WBSPhase[];
}

export interface GeneratedDocuments {
	proposal: ProposalDocument;
	resourcePlan: ResourceDocument;
	wbs: WBSDocument;
}

interface UseDocumentsOptions {
	projectId: string;
}

/**
 * Hook to manage generated project documents
 */
export function useDocuments({ projectId }: UseDocumentsOptions) {
	const [documents, setDocuments] = useState<GeneratedDocuments | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// Fetch latest snapshot
	const fetchLatestSnapshot = useCallback(async () => {
		setIsLoading(true);
		try {
			const res = await fetch(
				`${env.NEXT_PUBLIC_SERVER_URL}/ai/snapshots/latest/${projectId}`,
			);
			if (res.ok) {
				const json = await res.json();
				setDocuments(json.documents);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to fetch snapshots"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [projectId]);

	// Trigger full generation
	const generateDocuments = useCallback(async () => {
		setIsGenerating(true);
		setError(null);
		try {
			const res = await fetch(
				`${env.NEXT_PUBLIC_SERVER_URL}/ai/generate-docs/${projectId}`,
				{ method: "POST" },
			);
			if (res.ok) {
				const json = await res.json();
				setDocuments(json.documents);
			} else {
				const errorData = await res.json();
				throw new Error(errorData.error || "Generation failed");
			}
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to generate documents"),
			);
		} finally {
			setIsGenerating(false);
		}
	}, [projectId]);

	// Load initial data
	useEffect(() => {
		fetchLatestSnapshot();
	}, [fetchLatestSnapshot]);

	return {
		documents,
		isLoading,
		isGenerating,
		error,
		generateDocuments,
		refetch: fetchLatestSnapshot,
	};
}
