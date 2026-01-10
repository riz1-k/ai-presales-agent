"use client";

import { FileText, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProposalViewProps {
	content?: string | null;
	isLoading?: boolean;
}

export function ProposalView({
	content,
	isLoading = false,
}: ProposalViewProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				<Skeleton className="h-8 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
				<div className="pt-4">
					<Skeleton className="h-6 w-1/2" />
					<Skeleton className="mt-2 h-4 w-full" />
					<Skeleton className="mt-1 h-4 w-full" />
					<Skeleton className="mt-1 h-4 w-3/4" />
				</div>
				<div className="pt-4">
					<Skeleton className="h-6 w-1/2" />
					<Skeleton className="mt-2 h-24 w-full" />
				</div>
			</div>
		);
	}

	if (!content) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
					<FileText className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mb-2 font-medium text-lg">No Proposal Yet</h3>
				<p className="max-w-sm text-muted-foreground text-sm">
					Start chatting with the AI to generate a project proposal. The AI will
					gather information and create a comprehensive proposal document.
				</p>
				<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
					<Sparkles className="h-4 w-4" />
					<span>AI-generated content will appear here</span>
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
