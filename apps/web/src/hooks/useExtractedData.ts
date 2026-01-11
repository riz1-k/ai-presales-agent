"use client";

import { env } from "@ai-presales-agent/env/web";
import { useCallback, useEffect, useState } from "react";

/**
 * Extracted project data types (matching server schemas)
 */
export interface ExtractedProjectData {
	info?: {
		projectName?: string;
		clientName?: string;
		clientCompany?: string;
		projectDescription?: string;
		problemStatement?: string;
		objectives?: string[];
	};
	timelineBudget?: {
		startDate?: string;
		endDate?: string;
		durationWeeks?: number;
		budgetMin?: number;
		budgetMax?: number;
		budgetCurrency?: string;
		budgetNotes?: string;
	};
	deliverables?: Array<{
		name: string;
		description?: string;
		estimatedHours?: number;
		priority?: "high" | "medium" | "low";
	}>;
	team?: Array<{
		role: string;
		roleLabel?: string;
		count?: number;
		seniorityLevel?: "junior" | "mid" | "senior" | "lead";
		allocationPercentage?: number;
		estimatedHours?: number;
		hourlyRate?: number;
	}>;
	technical?: {
		technologies?: string[];
		integrations?: string[];
		platforms?: string[];
		constraints?: string[];
		securityRequirements?: string[];
	};
	risks?: string[];
	assumptions?: string[];
	outOfScope?: string[];
}

interface UseExtractedDataOptions {
	projectId: string;
	pollInterval?: number; // in milliseconds, default 5000
}

/**
 * Hook to fetch and manage extracted project data
 */
export function useExtractedData({
	projectId,
	pollInterval = 5000,
}: UseExtractedDataOptions) {
	const [data, setData] = useState<ExtractedProjectData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	// Fetch extracted data
	const fetchData = useCallback(async () => {
		try {
			const res = await fetch(
				`${env.NEXT_PUBLIC_SERVER_URL}/ai/extracted/${projectId}`,
			);
			if (res.ok) {
				const json = await res.json();
				setData(json.data);
				setLastUpdated(new Date());
				setError(null);
			}
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to fetch data"));
		} finally {
			setIsLoading(false);
		}
	}, [projectId]);

	// Initial fetch
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Poll for updates
	useEffect(() => {
		const interval = setInterval(fetchData, pollInterval);
		return () => clearInterval(interval);
	}, [fetchData, pollInterval]);

	// Manually trigger extraction
	const triggerExtraction = useCallback(async () => {
		try {
			const res = await fetch(
				`${env.NEXT_PUBLIC_SERVER_URL}/ai/extract/${projectId}`,
				{ method: "POST" },
			);
			if (res.ok) {
				const json = await res.json();
				setData(json.data);
				setLastUpdated(new Date());
			}
		} catch (err) {
			console.error("Failed to trigger extraction:", err);
		}
	}, [projectId]);

	return {
		data,
		isLoading,
		error,
		lastUpdated,
		refetch: fetchData,
		triggerExtraction,
	};
}
