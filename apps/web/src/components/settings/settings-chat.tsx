"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";

export function SettingsChat() {
	const { settings, updateSettings } = useSettings();

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in space-y-10 duration-500">
			<div className="flex flex-col gap-1">
				<h3 className="font-semibold text-2xl tracking-tight">
					AI & Chat Preferences
				</h3>
				<p className="text-muted-foreground text-sm">
					Optimize the AI assistant behavior and your chat interface workspace.
				</p>
			</div>

			<div className="grid gap-12">
				{/* Input Section */}
				<div className="space-y-6">
					<Label className="ml-1 font-bold text-muted-foreground text-sm uppercase tracking-widest">
						Chat Experience
					</Label>
					<div className="space-y-4">
						<div className="space-y-3">
							<Label
								htmlFor="chat-placeholder"
								className="ml-1 font-semibold text-foreground/70 text-xs uppercase tracking-tight"
							>
								Input Placeholder
							</Label>
							<Input
								id="chat-placeholder"
								value={settings.chat.placeholder}
								onChange={(e) =>
									updateSettings({
										chat: { ...settings.chat, placeholder: e.target.value },
									})
								}
								placeholder="Type a message..."
								className="h-12 rounded-xl border-muted-foreground/20 bg-background/50 font-medium transition-all focus:ring-primary/20"
							/>
							<p className="ml-1 text-[11px] text-muted-foreground">
								Customize the message that appears when the chat input is empty.
							</p>
						</div>
					</div>
				</div>

				<Separator className="opacity-50" />

				{/* Behavior Section */}
				<div className="space-y-6">
					<Label className="ml-1 font-bold text-muted-foreground text-sm uppercase tracking-widest">
						Workspace & Behavior
					</Label>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<div className="group flex items-center justify-between rounded-2xl border bg-card/40 p-5 shadow-sm backdrop-blur-sm transition-all hover:bg-card/60">
							<div className="space-y-1">
								<Label
									htmlFor="auto-scroll"
									className="font-bold text-base tracking-tight"
								>
									Scroll Lock
								</Label>
								<p className="max-w-[220px] text-[11px] text-muted-foreground leading-snug">
									Lock chat focus to new messages as they stream in.
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
								className="shadow-sm data-[state=checked]:bg-primary"
							/>
						</div>

						<div className="space-y-3">
							<Label
								htmlFor="default-tab"
								className="ml-1 font-semibold text-foreground/70 text-xs uppercase tracking-tight"
							>
								Initial View
							</Label>
							<Select
								value={settings.proposals.defaultTab}
								onValueChange={(value) => {
									if (
										value === "proposal" ||
										value === "wbs" ||
										value === "ra"
									) {
										updateSettings({
											proposals: { ...settings.proposals, defaultTab: value },
										});
									}
								}}
							>
								<SelectTrigger
									id="default-tab"
									className="h-12 rounded-xl border-muted-foreground/20 bg-background/50 transition-all focus:ring-primary/20"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="rounded-xl border-muted-foreground/20 shadow-xl">
									<SelectItem value="proposal" className="rounded-lg">
										Proposal Overview
									</SelectItem>
									<SelectItem value="wbs" className="rounded-lg">
										Work Breakdown Structure
									</SelectItem>
									<SelectItem value="ra" className="rounded-lg">
										Resource Allocation
									</SelectItem>
								</SelectContent>
							</Select>
							<p className="ml-1 text-[11px] text-muted-foreground">
								Choose which document analysis tab opens first.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
