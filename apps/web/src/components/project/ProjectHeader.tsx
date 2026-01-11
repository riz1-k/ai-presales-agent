"use client";

import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProjectStatus = "draft" | "pending_approval" | "approved" | "finalized";

interface ProjectHeaderProps {
	projectName: string;
	status: ProjectStatus;
	onNameChange?: (name: string) => void;
	isEditable?: boolean;
}

const statusConfig: Record<
	ProjectStatus,
	{ label: string; className: string }
> = {
	draft: {
		label: "Draft",
		className: "bg-muted text-muted-foreground",
	},
	pending_approval: {
		label: "Pending Approval",
		className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
	},
	approved: {
		label: "Approved",
		className: "bg-green-500/20 text-green-600 dark:text-green-400",
	},
	finalized: {
		label: "Finalized",
		className: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
	},
};

export function ProjectHeader({
	projectName,
	status,
	onNameChange,
	isEditable = true,
}: ProjectHeaderProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(projectName);

	const handleSave = () => {
		const trimmed = editValue.trim();
		if (trimmed && trimmed !== projectName) {
			onNameChange?.(trimmed);
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditValue(projectName);
		setIsEditing(false);
	};

	const statusInfo = statusConfig[status];

	return (
		<div className="flex items-center justify-between border-border border-b bg-background px-6 py-4 shadow-sm">
			<div className="flex items-center gap-4">
				{isEditing ? (
					<div className="flex items-center gap-2">
						<Input
							value={editValue}
							onChange={(e) => setEditValue(e.target.value)}
							className="h-9 w-72 rounded-lg"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
								if (e.key === "Escape") handleCancel();
							}}
						/>
						<Button
							size="icon"
							variant="ghost"
							className="h-9 w-9"
							onClick={handleSave}
						>
							<Check className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							className="h-9 w-9 text-muted-foreground hover:text-destructive"
							onClick={handleCancel}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<>
						<h1 className="font-bold text-xl tracking-tight">{projectName}</h1>
						{isEditable && (
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
								onClick={() => setIsEditing(true)}
							>
								<Edit2 className="h-3.5 w-3.5" />
							</Button>
						)}
					</>
				)}
			</div>

			<div className="flex items-center gap-4">
				{/* Status badge */}
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold text-xs transition-colors ${statusInfo.className}`}
				>
					<span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
					{statusInfo.label}
				</span>
			</div>
		</div>
	);
}
