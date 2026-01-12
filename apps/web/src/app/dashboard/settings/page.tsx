"use client";

import {
	Bell,
	ChevronRight,
	MessageSquare,
	Palette,
	Shield,
	User,
} from "lucide-react";
import { useState } from "react";
import { SettingsAppearance } from "@/components/settings/settings-appearance";
import { SettingsChat } from "@/components/settings/settings-chat";
import { SettingsNotifications } from "@/components/settings/settings-notifications";
import { SettingsProfile } from "@/components/settings/settings-profile";
import { SettingsSecurity } from "@/components/settings/settings-security";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAVIGATION_ITEMS = [
	{
		id: "profile",
		label: "Profile",
		icon: User,
		description: "Manage your personal information",
	},
	{
		id: "appearance",
		label: "Appearance",
		icon: Palette,
		description: "Customize theme and layout",
	},
	{
		id: "notifications",
		label: "Notifications",
		icon: Bell,
		description: "Control alerts and sounds",
	},
	{
		id: "chat",
		label: "AI & Chat",
		icon: MessageSquare,
		description: "AI preferences and chat settings",
	},
	{
		id: "security",
		label: "Security",
		icon: Shield,
		description: "Password and account safety",
	},
] as const;

type TabId = (typeof NAVIGATION_ITEMS)[number]["id"];

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState<TabId>("profile");

	const renderContent = () => {
		switch (activeTab) {
			case "profile":
				return <SettingsProfile />;
			case "appearance":
				return <SettingsAppearance />;
			case "notifications":
				return <SettingsNotifications />;
			case "chat":
				return <SettingsChat />;
			case "security":
				return <SettingsSecurity />;
			default:
				return <SettingsProfile />;
		}
	};

	return (
		<div className="container mx-auto max-w-6xl px-4 py-10">
			<div className="mb-10 flex flex-col gap-2">
				<h1 className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text font-bold text-4xl text-transparent tracking-tight">
					Settings
				</h1>
				<p className="max-w-2xl text-lg text-muted-foreground">
					Manage your account preferences, appearance, and AI configurations in
					one place.
				</p>
			</div>

			<Separator className="mb-10 opacity-50" />

			<div className="flex flex-col items-start gap-12 lg:flex-row">
				{/* Navigation Sidebar */}
				<aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-72">
					<nav className="flex gap-1.5 rounded-lg bg-muted/30 p-1 lg:flex-col lg:bg-transparent lg:p-0">
						{NAVIGATION_ITEMS.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => setActiveTab(item.id)}
								className={cn(
									"group relative flex items-center justify-between rounded-md px-4 py-3 font-medium text-sm transition-all duration-200",
									activeTab === item.id
										? "bg-background text-foreground shadow-sm ring-1 ring-border"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								<div className="flex items-center gap-3">
									<item.icon
										className={cn(
											"h-4 w-4 transition-colors",
											activeTab === item.id
												? "text-primary"
												: "text-muted-foreground group-hover:text-foreground",
										)}
									/>
									<span>{item.label}</span>
								</div>
								{activeTab === item.id && (
									<ChevronRight className="fade-in slide-in-from-left-2 h-3.5 w-3.5 animate-in text-primary" />
								)}
							</button>
						))}
					</nav>
				</aside>

				{/* Content Section */}
				<main className="w-full max-w-3xl flex-1">
					<div
						key={activeTab}
						className="fade-in slide-in-from-bottom-4 animate-in duration-500 ease-out"
					>
						{renderContent()}
					</div>
				</main>
			</div>
		</div>
	);
}
