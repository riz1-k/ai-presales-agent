"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface RecoveryModalProps {
	open: boolean;
	onRecover: () => void;
	onDiscard: () => void;
	lastModified?: Date;
}

export function RecoveryModal({
	open,
	onRecover,
	onDiscard,
	lastModified,
}: RecoveryModalProps) {
	const formatTime = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}).format(date);
	};

	return (
		<Dialog open={open} onOpenChange={() => {}}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
							<AlertCircle className="h-6 w-6 text-yellow-600" />
						</div>
						<DialogTitle>Recover Unsaved Work?</DialogTitle>
					</div>
					<DialogDescription className="pt-4">
						We found unsaved changes from your previous session
						{lastModified && ` (last modified ${formatTime(lastModified)})`}.
						Would you like to recover this work?
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="flex gap-2 sm:gap-2">
					<Button variant="outline" onClick={onDiscard}>
						Discard Changes
					</Button>
					<Button onClick={onRecover}>Recover Work</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
