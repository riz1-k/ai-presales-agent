"use client";

import {
	CalendarDays,
	Clock,
	FileText,
	ListTree,
	MessageSquare,
	Users,
} from "lucide-react";
import type { DocumentTabType } from "@/components/documents";

type ProjectStatus = "draft" | "pending_approval" | "approved" | "finalized";

interface ProjectSidebarProps {
	projectName: string;
	status: ProjectStatus;
	messagesCount: number;
	lastUpdated: Date;
	createdAt: Date;
	activeTab: DocumentTabType;
	onTabChange: (tab: DocumentTabType) => void;
	documentsReady: {
		proposal: boolean;
		resource_plan: boolean;
		wbs: boolean;
	};
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

const documentTabs = [
	{ id: "proposal" as const, label: "Proposal", icon: FileText },
	{ id: "resource_plan" as const, label: "Resources", icon: Users },
	{ id: "wbs" as const, label: "WBS", icon: ListTree },
];

export function ProjectSidebar({
	projectName,
	status,
	messagesCount,
	lastUpdated,
	createdAt,
	activeTab,
	onTabChange,
	documentsReady,
}: ProjectSidebarProps) {
	const statusInfo = statusConfig[status];

	return (
		<div className="flex h-full w-64 flex-col border-border border-r bg-muted/30">
			{/* Project info */}
			<div className="border-border border-b p-4">
				<h2 className="mb-2 truncate font-semibold text-lg" title={projectName}>
					{projectName}
				</h2>
				<span
					className={`inline-block rounded-full px-3 py-1 font-medium text-xs ${statusInfo.className}`}
				>
					{statusInfo.label}
				</span>
			</div>

			{/* Quick stats */}
			<div className="border-border border-b p-4">
				<h3 className="mb-3 font-medium text-muted-foreground text-xs uppercase">
					Overview
				</h3>
				<div className="space-y-3">
					<div className="flex items-center gap-3 text-sm">
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
						<span>{messagesCount} messages</span>
					</div>
					<div className="flex items-center gap-3 text-sm">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span>
							Updated{" "}
							{lastUpdated.toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
							})}
						</span>
					</div>
					<div className="flex items-center gap-3 text-sm">
						<CalendarDays className="h-4 w-4 text-muted-foreground" />
						<span>
							Created{" "}
							{createdAt.toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
							})}
						</span>
					</div>
				</div>
			</div>

			{/* Document navigation */}
			<div className="flex-1 p-4">
				<h3 className="mb-3 font-medium text-muted-foreground text-xs uppercase">
					Documents
				</h3>
				<nav className="space-y-1">
					{documentTabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;
						const isReady = documentsReady[tab.id];

						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => onTabChange(tab.id)}
								className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
									isActive
										? "bg-primary text-primary-foreground"
										: "text-foreground hover:bg-muted"
								}`}
							>
								<Icon className="h-4 w-4" />
								<span className="flex-1 text-left">{tab.label}</span>
								{isReady && (
									<span
										className={`h-2 w-2 rounded-full ${
											isActive ? "bg-primary-foreground" : "bg-green-500"
										}`}
									/>
								)}
							</button>
						);
					})}
				</nav>
			</div>
		</div>
	);
}
