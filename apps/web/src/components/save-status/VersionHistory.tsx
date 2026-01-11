"use client";

import { Clock, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Version {
	id: string;
	versionNumber: number;
	changeSummary: string | null;
	completenessScore: number | null;
	createdAt: Date | string;
}

interface VersionHistoryProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	versions: Version[];
	onRestore: (versionId: string) => void;
	isRestoring?: boolean;
}

export function VersionHistory({
	open,
	onOpenChange,
	versions,
	onRestore,
	isRestoring = false,
}: VersionHistoryProps) {
	const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

	const formatTime = (date: Date | string) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}).format(new Date(date));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Version History
					</DialogTitle>
					<DialogDescription>
						View and restore previous versions of your project
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-[400px] pr-4">
					{versions.length === 0 ? (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							No versions available
						</div>
					) : (
						<div className="space-y-3">
							{versions.map((version) => (
								<div
									key={version.id}
									className={`rounded-lg border p-4 transition-colors ${
										selectedVersion === version.id
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50"
									}`}
									onClick={() => setSelectedVersion(version.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											setSelectedVersion(version.id);
										}
									}}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">
													Version {version.versionNumber}
												</span>
												{version.completenessScore !== null && (
													<span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 text-xs">
														{version.completenessScore}% complete
													</span>
												)}
											</div>
											<p className="mt-1 text-muted-foreground text-sm">
												{version.changeSummary || "No description"}
											</p>
											<p className="mt-2 text-muted-foreground text-xs">
												{formatTime(version.createdAt)}
											</p>
										</div>

										{selectedVersion === version.id && (
											<Button
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													onRestore(version.id);
												}}
												disabled={isRestoring}
											>
												<RotateCcw className="mr-2 h-4 w-4" />
												{isRestoring ? "Restoring..." : "Restore"}
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
