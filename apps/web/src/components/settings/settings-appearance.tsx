"use client";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/use-settings";

export function SettingsAppearance() {
	const { theme, setTheme } = useTheme();
	const { settings, updateSettings } = useSettings();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Palette className="h-5 w-5 text-muted-foreground" />
					<CardTitle>Appearance</CardTitle>
				</div>
				<CardDescription>
					Customize the look and feel of the application
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-3">
					<Label>Theme</Label>
					<RadioGroup
						value={theme}
						onValueChange={(value) =>
							setTheme(value as "light" | "dark" | "system")
						}
						className="flex gap-4"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="light" id="light" />
							<Label htmlFor="light" className="cursor-pointer font-normal">
								Light
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="dark" id="dark" />
							<Label htmlFor="dark" className="cursor-pointer font-normal">
								Dark
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="system" id="system" />
							<Label htmlFor="system" className="cursor-pointer font-normal">
								System
							</Label>
						</div>
					</RadioGroup>
				</div>

				<div className="space-y-3">
					<Label htmlFor="sidebar-position">Sidebar Position</Label>
					<Select
						value={settings.sidebar.side}
						onValueChange={(value) => {
							if (value === "left" || value === "right") {
								updateSettings({
									sidebar: { ...settings.sidebar, side: value },
								});
							}
						}}
					>
						<SelectTrigger id="sidebar-position">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="left">Left</SelectItem>
							<SelectItem value="right">Right</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-3">
					<Label htmlFor="sidebar-behavior">Sidebar Behavior</Label>
					<Select
						value={settings.sidebar.collapsible}
						onValueChange={(value) => {
							if (
								value === "offcanvas" ||
								value === "icon" ||
								value === "none"
							) {
								updateSettings({
									sidebar: { ...settings.sidebar, collapsible: value },
								});
							}
						}}
					>
						<SelectTrigger id="sidebar-behavior">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="icon">Icon Collapse</SelectItem>
							<SelectItem value="offcanvas">Offcanvas</SelectItem>
							<SelectItem value="none">None</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-muted-foreground text-xs">
						Changes will take effect on next page load
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
