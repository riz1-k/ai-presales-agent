"use client";

import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Archive,
	CheckCircle2,
	Clock,
	FileCheck,
	FilePenLine,
	Lock,
	XCircle,
} from "lucide-react";

type ProjectStatus =
	| "draft"
	| "pending_approval"
	| "changes_requested"
	| "approved"
	| "finalized"
	| "archived";

interface ApprovalStatusProps {
	status: ProjectStatus;
	showTooltip?: boolean;
	className?: string;
}

const STATUS_CONFIG: Record<
	ProjectStatus,
	{
		label: string;
		icon: React.ReactNode;
		variant: "default" | "secondary" | "destructive" | "outline";
		color: string;
		description: string;
	}
> = {
	draft: {
		label: "Draft",
		icon: <FilePenLine className="h-3 w-3" />,
		variant: "secondary",
		color: "text-gray-700 bg-gray-100",
		description: "Project is being actively edited",
	},
	pending_approval: {
		label: "Pending Approval",
		icon: <Clock className="h-3 w-3" />,
		variant: "outline",
		color: "text-yellow-700 bg-yellow-50 border-yellow-300",
		description: "Awaiting review from approver",
	},
	changes_requested: {
		label: "Changes Requested",
		icon: <XCircle className="h-3 w-3" />,
		variant: "destructive",
		color: "text-orange-700 bg-orange-50 border-orange-300",
		description: "Reviewer has requested changes",
	},
	approved: {
		label: "Approved",
		icon: <CheckCircle2 className="h-3 w-3" />,
		variant: "default",
		color: "text-green-700 bg-green-50 border-green-300",
		description: "Approved and ready for finalization",
	},
	finalized: {
		label: "Finalized",
		icon: <Lock className="h-3 w-3" />,
		variant: "default",
		color: "text-blue-700 bg-blue-50 border-blue-300",
		description: "Project is finalized and locked",
	},
	archived: {
		label: "Archived",
		icon: <Archive className="h-3 w-3" />,
		variant: "secondary",
		color: "text-gray-600 bg-gray-50 border-gray-300",
		description: "Project is archived",
	},
};

export function ApprovalStatus({
	status,
	showTooltip = true,
	className,
}: ApprovalStatusProps) {
	const config = STATUS_CONFIG[status];

	const badge = (
		<Badge
			variant={config.variant}
			className={`flex items-center gap-1.5 ${config.color} ${className}`}
		>
			{config.icon}
			<span>{config.label}</span>
		</Badge>
	);

	if (!showTooltip) {
		return badge;
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{badge}</TooltipTrigger>
				<TooltipContent>
					<p>{config.description}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
