"use client";

import { MessageSquare } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";

export function SettingsChat() {
	const { settings, updateSettings } = useSettings();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5 text-muted-foreground" />
					<CardTitle>AI & Chat Preferences</CardTitle>
				</div>
				<CardDescription>
					Customize your AI chat experience and document preferences
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-3">
					<Label htmlFor="chat-placeholder">Chat Placeholder</Label>
					<Input
						id="chat-placeholder"
						value={settings.chat.placeholder}
						onChange={(e) =>
							updateSettings({
								chat: { ...settings.chat, placeholder: e.target.value },
							})
						}
						placeholder="Type a message..."
					/>
					<p className="text-muted-foreground text-xs">
						Custom placeholder text for the chat input
					</p>
				</div>

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="auto-scroll">Auto Scroll</Label>
						<p className="text-muted-foreground text-xs">
							Automatically scroll to new messages
						</p>
					</div>
					<Switch
						id="auto-scroll"
						checked={settings.chat.autoScroll}
						onCheckedChange={(checked) =>
							updateSettings({
								chat: { ...settings.chat, autoScroll: checked },
							})
						}
					/>
				</div>

				<div className="space-y-3">
					<Label htmlFor="default-tab">Default Document Tab</Label>
					<Select
						value={settings.proposals.defaultTab}
						onValueChange={(value) => {
							if (value === "proposal" || value === "wbs" || value === "ra") {
								updateSettings({
									proposals: { ...settings.proposals, defaultTab: value },
								});
							}
						}}
					>
						<SelectTrigger id="default-tab">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="proposal">Proposal Overview</SelectItem>
							<SelectItem value="wbs">Work Breakdown Structure</SelectItem>
							<SelectItem value="ra">Resource Allocation</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-muted-foreground text-xs">
						Which document tab to show by default
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
