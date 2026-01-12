"use client";

import { Bell } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";

export function SettingsNotifications() {
	const { settings, updateSettings } = useSettings();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Bell className="h-5 w-5 text-muted-foreground" />
					<CardTitle>Notifications</CardTitle>
				</div>
				<CardDescription>
					Control how and where notifications appear
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-3">
					<Label htmlFor="toast-position">Toast Position</Label>
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
						<SelectTrigger id="toast-position">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="top-left">Top Left</SelectItem>
							<SelectItem value="top-center">Top Center</SelectItem>
							<SelectItem value="top-right">Top Right</SelectItem>
							<SelectItem value="bottom-left">Bottom Left</SelectItem>
							<SelectItem value="bottom-center">Bottom Center</SelectItem>
							<SelectItem value="bottom-right">Bottom Right</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label htmlFor="toast-duration">Duration</Label>
						<span className="text-muted-foreground text-sm">
							{settings.notifications.duration}ms
						</span>
					</div>
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
					/>
					<p className="text-muted-foreground text-xs">
						How long notifications stay visible
					</p>
				</div>

				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<Label htmlFor="typing-indicators">Typing Indicators</Label>
						<p className="text-muted-foreground text-xs">
							Show when AI is generating responses
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
					/>
				</div>
			</CardContent>
		</Card>
	);
}
