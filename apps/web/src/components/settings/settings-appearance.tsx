"use client";

import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

export function SettingsAppearance() {
	const { theme, setTheme } = useTheme();
	const { settings, updateSettings } = useSettings();

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in space-y-10 duration-500">
			<div className="flex flex-col gap-1">
				<h3 className="font-semibold text-2xl tracking-tight">Appearance</h3>
				<p className="text-muted-foreground text-sm">
					Customize the interface to match your preference and workflow.
				</p>
			</div>

			<div className="grid gap-12">
				{/* Theme Section */}
				<div className="space-y-6">
					<Label className="ml-1 font-bold text-muted-foreground text-sm uppercase tracking-widest">
						Theme Preferences
					</Label>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
						{(["light", "dark", "system"] as const).map((t) => (
							<button
								key={t}
								type="button"
								onClick={() => setTheme(t)}
								className={cn(
									"group relative flex flex-col gap-4 rounded-2xl border-2 p-2 text-left transition-all duration-300",
									theme === t
										? "border-primary bg-primary/5 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
										: "border-transparent bg-card hover:border-muted-foreground/20 hover:bg-muted/40",
								)}
							>
								<div
									className={cn(
										"relative h-28 w-full overflow-hidden rounded-[0.5rem] border shadow-inner",
										t === "light"
											? "bg-slate-50"
											: t === "dark"
												? "bg-slate-950"
												: "bg-gradient-to-br from-slate-50 to-slate-950",
									)}
								>
									{/* Mock UI for preview */}
									<div className="space-y-2 p-3">
										<div
											className={cn(
												"h-2 w-1/2 rounded-full",
												t === "light" ? "bg-slate-200" : "bg-slate-800",
											)}
										/>
										<div
											className={cn(
												"h-2 w-full rounded-full",
												t === "light" ? "bg-slate-100" : "bg-slate-900",
											)}
										/>
										<div className="grid grid-cols-2 gap-2 pt-1">
											<div
												className={cn(
													"h-10 rounded-md border",
													t === "light" ? "bg-white" : "bg-slate-900/50",
												)}
											/>
											<div
												className={cn(
													"h-10 rounded-md border bg-primary/20",
													t === "light"
														? "border-primary/20"
														: "border-primary/10",
												)}
											/>
										</div>
									</div>
									{theme === t && (
										<div className="fade-in pointer-events-none absolute inset-0 animate-in rounded-[0.5rem] border-2 border-primary duration-500" />
									)}
								</div>
								<div className="flex items-center justify-between px-2 pb-1">
									<span className="font-bold text-sm capitalize tracking-tight">
										{t}
									</span>
									{theme === t && (
										<div className="flex items-center gap-1.5">
											<span className="font-bold text-[10px] text-primary uppercase">
												Active
											</span>
											<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
										</div>
									)}
								</div>
							</button>
						))}
					</div>
				</div>

				<Separator className="opacity-50" />

				{/* Sidebar Section */}
				<div className="space-y-6">
					<Label className="ml-1 font-bold text-muted-foreground text-sm uppercase tracking-widest">
						Navigation Layout
					</Label>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<div className="space-y-3">
							<Label
								htmlFor="sidebar-position"
								className="ml-1 font-semibold text-foreground/70 text-xs"
							>
								Sidebar Position
							</Label>
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
								<SelectTrigger
									id="sidebar-position"
									className="h-12 rounded-xl border-muted-foreground/20 bg-background/50 transition-all focus:ring-primary/20"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="rounded-xl border-muted-foreground/20">
									<SelectItem value="left" className="rounded-lg">
										Left Hand Side
									</SelectItem>
									<SelectItem value="right" className="rounded-lg">
										Right Hand Side
									</SelectItem>
								</SelectContent>
							</Select>
							<p className="ml-1 text-[11px] text-muted-foreground">
								Choose where the main sidebar is docked.
							</p>
						</div>

						<div className="space-y-3">
							<Label
								htmlFor="sidebar-behavior"
								className="ml-1 font-semibold text-foreground/70 text-xs"
							>
								Interaction Style
							</Label>
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
								<SelectTrigger
									id="sidebar-behavior"
									className="h-12 rounded-xl border-muted-foreground/20 bg-background/50 transition-all focus:ring-primary/20"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="rounded-xl border-muted-foreground/20">
									<SelectItem value="icon" className="rounded-lg">
										Icon Collapse (Compact)
									</SelectItem>
									<SelectItem value="offcanvas" className="rounded-lg">
										Offcanvas (Mobile Only)
									</SelectItem>
									<SelectItem value="none" className="rounded-lg">
										Always Expanded (Full)
									</SelectItem>
								</SelectContent>
							</Select>
							<p className="ml-1 text-[11px] text-muted-foreground">
								Changes are applied immediately.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
