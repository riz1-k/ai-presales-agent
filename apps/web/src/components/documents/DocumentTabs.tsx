"use client";

import { FileText, ListTree, Users } from "lucide-react";
import { type ReactNode, useState } from "react";

export type DocumentTabType = "proposal" | "resource_plan" | "wbs";

interface TabConfig {
	id: DocumentTabType;
	label: string;
	icon: typeof FileText;
}

const tabs: TabConfig[] = [
	{ id: "proposal", label: "Proposal", icon: FileText },
	{ id: "resource_plan", label: "Resources", icon: Users },
	{ id: "wbs", label: "WBS", icon: ListTree },
];

// Update DocumentTabsProps interface
interface DocumentTabsProps {
	activeTab?: DocumentTabType;
	onTabChange?: (tab: DocumentTabType) => void;
	children?: (tab: DocumentTabType) => ReactNode;
	actions?: ReactNode;
}

export function DocumentTabs({
	activeTab: controlledActiveTab,
	onTabChange,
	children,
	actions,
}: DocumentTabsProps) {
	const [internalActiveTab, setInternalActiveTab] =
		useState<DocumentTabType>("proposal");
	const activeTab = controlledActiveTab ?? internalActiveTab;

	const handleTabChange = (tab: DocumentTabType) => {
		if (onTabChange) {
			onTabChange(tab);
		} else {
			setInternalActiveTab(tab);
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Tab headers */}
			<div className="flex items-center border-border border-b bg-muted/30 pr-2">
				<div className="flex flex-1">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;

						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => handleTabChange(tab.id)}
								className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 font-medium text-sm transition-all ${
									isActive
										? "border-primary bg-background text-foreground"
										: "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
								}`}
							>
								<Icon className="h-4 w-4" />
								<span className="hidden sm:inline">{tab.label}</span>
							</button>
						);
					})}
				</div>
				{actions && <div className="shrink-0 pl-2">{actions}</div>}
			</div>

			{/* Tab content */}
			<div className="flex-1 overflow-y-auto">
				{children ? children(activeTab) : null}
			</div>
		</div>
	);
}
