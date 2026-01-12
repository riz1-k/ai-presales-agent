"use client";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";

export function SettingsNotifications() {
	const { settings, updateSettings } = useSettings();

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in space-y-10 duration-500">
			<div className="flex flex-col gap-1">
				<h3 className="font-semibold text-2xl tracking-tight">
					Notification Settings
				</h3>
				<p className="text-muted-foreground text-sm">
					Customize how you receive alerts and feedback from the application.
				</p>
			</div>

			<div className="grid gap-12">
				{/* Desktop Alerts Section */}
				<div className="space-y-6">
					<Label className="ml-1 font-bold text-muted-foreground text-sm uppercase tracking-widest">
						Desktop Alerts
					</Label>
					<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
						<div className="space-y-3">
							<Label
								htmlFor="toast-position"
								className="ml-1 font-semibold text-foreground/70 text-xs"
							>
								Popup Position
							</Label>
							<Select
								value={settings.notifications.position}
								onValueChange={(value) => {
									const validPositions = [
										"top-left",
										"top-center",
										"top-right",
										"bottom-left",
										"bottom-center",
										"bottom-right",
									] as const;
									if (
										value &&
										validPositions.includes(
											value as (typeof validPositions)[number],
										)
									) {
										updateSettings({
											notifications: {
												...settings.notifications,
												position: value as (typeof validPositions)[number],
											},
										});
									}
								}}
							>
								<SelectTrigger
									id="toast-position"
									className="h-12 rounded-xl border-muted-foreground/20 bg-background/50 transition-all focus:ring-primary/20"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="rounded-xl border-muted-foreground/20">
									<SelectItem value="top-right" className="rounded-lg">
										Top Right Corner
									</SelectItem>
									<SelectItem value="bottom-right" className="rounded-lg">
										Bottom Right Corner
									</SelectItem>
									<SelectItem value="top-left" className="rounded-lg">
										Top Left Corner
									</SelectItem>
									<SelectItem value="bottom-left" className="rounded-lg">
										Bottom Left Corner
									</SelectItem>
									<SelectItem value="top-center" className="rounded-lg">
										Top Center
									</SelectItem>
									<SelectItem value="bottom-center" className="rounded-lg">
										Bottom Center
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-3">
							<div className="ml-1 flex items-center justify-between">
								<Label
									htmlFor="toast-duration"
									className="font-semibold text-foreground/70 text-xs"
								>
									Visibility Duration
								</Label>
								<span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary text-xs ring-1 ring-primary/20">
									{settings.notifications.duration / 1000}s
								</span>
							</div>
							<div className="px-1 pt-4">
								<Slider
									id="toast-duration"
									min={1000}
									max={10000}
									step={500}
									value={[settings.notifications.duration]}
									onValueChange={(value) => {
										if (Array.isArray(value) && value.length > 0) {
											updateSettings({
												notifications: {
													...settings.notifications,
													duration: value[0],
												},
											});
										}
									}}
									className="py-2"
								/>
							</div>
						</div>
					</div>
				</div>

				<Separator className="opacity-50" />

				{/* Interface Feedback Section */}
				<div className="space-y-6">
					<Label className="ml-1 font-bold text-muted-foreground text-sm uppercase tracking-widest">
						Interface Feedback
					</Label>
					<div className="grid gap-4">
						<div className="group flex items-center justify-between rounded-2xl border bg-muted/5 p-5 transition-all hover:bg-muted/10">
							<div className="space-y-1">
								<Label
									htmlFor="typing-indicators"
									className="font-bold text-base tracking-tight"
								>
									Typing Indicators
								</Label>
								<p className="max-w-md text-muted-foreground text-xs leading-relaxed">
									Display visual cues when the AI is processing information or
									generating content to provide a smoother experience.
								</p>
							</div>
							<Switch
								id="typing-indicators"
								checked={settings.chat.showTypingIndicators}
								onCheckedChange={(checked) =>
									updateSettings({
										chat: { ...settings.chat, showTypingIndicators: checked },
									})
								}
								className="data-[state=checked]:bg-primary"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
