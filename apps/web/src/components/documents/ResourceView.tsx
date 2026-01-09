"use client";

import { Code2, Info, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExtractedProjectData, GeneratedDocuments } from "@/hooks";

interface ResourceViewProps {
	extractedData?: ExtractedProjectData | null;
	generatedDocuments?: GeneratedDocuments | null;
	isLoading?: boolean;
}

const seniorityColors = {
	junior: "bg-green-500/20 text-green-600 dark:text-green-400",
	mid: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
	senior: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
	lead: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
};

export function ResourceView({
	extractedData,
	generatedDocuments,
	isLoading = false,
}: ResourceViewProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				<Skeleton className="h-8 w-1/2" />
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="flex items-center gap-4 rounded-lg border p-4"
						>
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	const resourcePlan = generatedDocuments?.resourcePlan;
	const team = extractedData?.team;
	const technical = extractedData?.technical;

	// Check if there's any meaningful data to display
	const hasData =
		resourcePlan ||
		(team && team.length > 0) ||
		(technical?.technologies && technical.technologies.length > 0);

	if (!hasData) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
					<Users className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mb-2 font-medium text-lg">No Resource Plan Yet</h3>
				<p className="max-w-sm text-muted-foreground text-sm">
					The AI will create a resource allocation plan based on your project
					requirements.
				</p>
				<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
					<Sparkles className="h-4 w-4" />
					<span>Resource allocation will appear here</span>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{!resourcePlan && (
				<div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
					<div className="flex items-center gap-2 text-primary text-sm">
						<Info className="h-4 w-4" />
						<span>
							Draft view. Generate to see AI-powered resource strategy.
						</span>
					</div>
				</div>
			)}

			{/* Strategy Summary (from generated doc) */}
			{resourcePlan?.summary && (
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Sparkles className="h-4 w-4 text-primary" />
							Resource Strategy
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-foreground/80 text-sm italic leading-relaxed">
							{resourcePlan.summary}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Team Requirements */}
			{team && team.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Team Composition
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{team.map((member, index) => (
								<div
									key={index}
									className="flex items-center justify-between rounded-lg border p-4"
								>
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
											{member.count || 1}x
										</div>
										<div>
											<h4 className="font-medium">{member.role}</h4>
											{member.skillset && member.skillset.length > 0 && (
												<p className="text-muted-foreground text-xs">
													{member.skillset.join(", ")}
												</p>
											)}
										</div>
									</div>
									<div className="flex items-center gap-3">
										{member.seniorityLevel && (
											<Badge
												variant="secondary"
												className={`text-[10px] ${seniorityColors[member.seniorityLevel]}`}
											>
												{member.seniorityLevel}
											</Badge>
										)}
										{member.estimatedHours && (
											<span className="font-mono text-muted-foreground text-xs">
												{member.estimatedHours}h
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Technical Stack */}
			{technical?.technologies && technical.technologies.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Code2 className="h-5 w-5" />
							Technology Stack
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{technical.technologies.map((tech, index) => (
								<Badge key={index} variant="secondary">
									{tech}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
