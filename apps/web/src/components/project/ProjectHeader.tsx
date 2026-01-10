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
		<div className="flex items-center justify-between border-border border-b bg-background px-4 py-3">
			<div className="flex items-center gap-3">
				{isEditing ? (
					<div className="flex items-center gap-2">
						<Input
							value={editValue}
							onChange={(e) => setEditValue(e.target.value)}
							className="h-8 w-64"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
								if (e.key === "Escape") handleCancel();
							}}
						/>
						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8"
							onClick={handleSave}
						>
							<Check className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8"
							onClick={handleCancel}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<>
						<h1 className="font-semibold text-lg">{projectName}</h1>
						{isEditable && (
							<Button
								size="icon"
								variant="ghost"
								className="h-8 w-8"
								onClick={() => setIsEditing(true)}
							>
								<Edit2 className="h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</div>

			{/* Status badge */}
			<span
				className={`rounded-full px-3 py-1 font-medium text-xs ${statusInfo.className}`}
			>
				{statusInfo.label}
			</span>
		</div>
	);
}
