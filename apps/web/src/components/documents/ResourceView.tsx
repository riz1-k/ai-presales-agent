"use client";

import { Sparkles, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResourceViewProps {
	content?: string | null;
	isLoading?: boolean;
}

export function ResourceView({
	content,
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
							<Skeleton className="h-6 w-16" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!content) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
					<Users className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mb-2 font-medium text-lg">No Resource Plan Yet</h3>
				<p className="max-w-sm text-muted-foreground text-sm">
					The AI will create a resource allocation plan based on your project
					requirements. This includes team roles, skills needed, and time
					estimates.
				</p>
				<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
					<Sparkles className="h-4 w-4" />
					<span>Resource allocation will appear here</span>
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
