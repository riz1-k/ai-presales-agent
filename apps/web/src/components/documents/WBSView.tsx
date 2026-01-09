"use client";

import { ChevronRight, Info, ListTree, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExtractedProjectData, GeneratedDocuments } from "@/hooks";

interface WBSViewProps {
	extractedData?: ExtractedProjectData | null;
	generatedDocuments?: GeneratedDocuments | null;
	isLoading?: boolean;
}

const priorityConfig = {
	high: "bg-red-500/10 text-red-600 border-red-200",
	medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
	low: "bg-green-500/10 text-green-600 border-green-200",
};

export function WBSView({
	extractedData,
	generatedDocuments,
	isLoading = false,
}: WBSViewProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				<Skeleton className="h-8 w-1/2" />
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="space-y-2">
							<Skeleton className="h-6 w-1/3" />
							<div className="ml-4 space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	const wbs = generatedDocuments?.wbs;
	const deliverables = extractedData?.deliverables;

	// Check if there's any meaningful data to display
	const hasData = wbs || (deliverables && deliverables.length > 0);

	if (!hasData) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
					<ListTree className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mb-2 font-medium text-lg">No WBS Yet</h3>
				<p className="max-w-sm text-muted-foreground text-sm">
					The AI will create a detailed work breakdown structure once
					deliverables are identified.
				</p>
				<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
					<Sparkles className="h-4 w-4" />
					<span>Task breakdown will appear here</span>
				</div>
			</div>
		);
	}

	// Calculate totals for summary cards
	const totalHours = wbs
		? wbs.phases.reduce(
				(sum, p) =>
					sum + p.tasks.reduce((tsum, t) => tsum + t.estimatedHours, 0),
				0,
			)
		: deliverables?.reduce((sum, d) => sum + (d.estimatedHours || 0), 0) || 0;

	const taskCount = wbs
		? wbs.phases.reduce((sum, p) => sum + p.tasks.length, 0)
		: deliverables?.length || 0;

	return (
		<div className="space-y-6 p-6">
			{!wbs && (
				<div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
					<div className="flex items-center gap-2 text-primary text-sm">
						<Info className="h-4 w-4" />
						<span>
							Draft view. Generate to see structured project phases and tasks.
						</span>
					</div>
				</div>
			)}

			{/* Summary Stats */}
			<div className="grid grid-cols-2 gap-4">
				<Card>
					<CardContent className="flex flex-col items-center justify-center p-4">
						<span className="font-bold text-2xl">{taskCount}</span>
						<span className="text-muted-foreground text-xs">Total Tasks</span>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex flex-col items-center justify-center p-4">
						<span className="font-bold text-2xl">{totalHours}h</span>
						<span className="text-muted-foreground text-xs">
							Estimated Effort
						</span>
					</CardContent>
				</Card>
			</div>

			{/* Phase Breakdown (from generated doc) */}
			{wbs && (
				<div className="space-y-6">
					{wbs.phases.map((phase) => (
						<div key={phase.id} className="space-y-3">
							<div className="flex items-center gap-2 rounded-md bg-secondary/50 p-2">
								<ChevronRight className="h-4 w-4 text-muted-foreground" />
								<h3 className="font-semibold text-sm uppercase tracking-wider">
									{phase.name}
								</h3>
								<Badge variant="outline" className="ml-auto text-[10px]">
									{phase.tasks.reduce((sum, t) => sum + t.estimatedHours, 0)}h
								</Badge>
							</div>
							<div className="ml-4 space-y-2">
								{phase.tasks.map((task) => (
									<div
										key={task.id}
										className="flex items-start justify-between border-border/10 border-b pr-2 pb-2"
									>
										<div className="space-y-1">
											<p className="font-medium text-sm">{task.name}</p>
											{task.description && (
												<p className="text-muted-foreground text-xs">
													{task.description}
												</p>
											)}
										</div>
										<div className="flex items-center gap-2">
											{task.priority && (
												<Badge
													variant="outline"
													className={`h-4 text-[9px] ${priorityConfig[task.priority]}`}
												>
													{task.priority}
												</Badge>
											)}
											<span className="font-mono text-[10px] text-muted-foreground">
												{task.estimatedHours}h
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Fallback Deliverables List */}
			{!wbs && deliverables && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-sm">
							<ListTree className="h-4 w-4" />
							Extracted Deliverables
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{deliverables.map((d, i) => (
							<div
								key={i}
								className="flex items-center justify-between border-border/50 border-b py-1 last:border-0"
							>
								<span className="text-sm">{d.name}</span>
								{d.estimatedHours && (
									<Badge variant="secondary" className="text-[10px]">
										{d.estimatedHours}h
									</Badge>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
