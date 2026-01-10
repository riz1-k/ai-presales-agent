"use client";

import { ListTree, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WBSViewProps {
	content?: string | null;
	isLoading?: boolean;
}

export function WBSView({ content, isLoading = false }: WBSViewProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				<Skeleton className="h-8 w-1/2" />
				{/* Tree structure skeleton */}
				<div className="space-y-2">
					<Skeleton className="h-6 w-1/3" />
					<div className="ml-6 space-y-2">
						<Skeleton className="h-5 w-1/2" />
						<div className="ml-6 space-y-1">
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-4 w-3/5" />
						</div>
						<Skeleton className="h-5 w-1/2" />
						<div className="ml-6 space-y-1">
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					</div>
					<Skeleton className="h-6 w-2/5" />
					<div className="ml-6 space-y-2">
						<Skeleton className="h-5 w-1/2" />
						<Skeleton className="h-5 w-2/5" />
					</div>
				</div>
			</div>
		);
	}

	if (!content) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
					<ListTree className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mb-2 font-medium text-lg">
					No Work Breakdown Structure Yet
				</h3>
				<p className="max-w-sm text-muted-foreground text-sm">
					The AI will create a detailed work breakdown structure (WBS) showing
					all tasks, subtasks, and deliverables for your project.
				</p>
				<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
					<Sparkles className="h-4 w-4" />
					<span>Task breakdown will appear here</span>
				</div>
			</div>
		);
	}

	return (
		<div className="prose prose-sm dark:prose-invert max-w-none p-6">
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is expected to be HTML */}
			<div dangerouslySetInnerHTML={{ __html: content }} />
		</div>
	);
}
