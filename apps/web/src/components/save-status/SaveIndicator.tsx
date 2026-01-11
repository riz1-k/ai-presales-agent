import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { AutoSaveStatus } from "@/hooks/useAutoSave";

interface SaveIndicatorProps {
	status: AutoSaveStatus;
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
	const formatTime = (date: Date | null) => {
		if (!date) return "";
		return new Intl.DateTimeFormat("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}).format(date);
	};

	return (
		<div className="flex items-center gap-2 text-sm">
			{status.status === "saving" && (
				<>
					<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
					<span className="text-muted-foreground">Saving...</span>
				</>
			)}

			{status.status === "saved" && (
				<>
					<CheckCircle2 className="h-4 w-4 text-green-500" />
					<span className="text-muted-foreground">
						Saved {status.lastSaved && `at ${formatTime(status.lastSaved)}`}
					</span>
				</>
			)}

			{status.status === "error" && (
				<>
					<XCircle className="h-4 w-4 text-red-500" />
					<span className="text-red-500">Save failed</span>
				</>
			)}

			{status.status === "idle" && (
				<>
					<Circle className="h-4 w-4 text-gray-400" />
					<span className="text-muted-foreground">Unsaved changes</span>
				</>
			)}
		</div>
	);
}
