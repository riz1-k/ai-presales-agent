"use client";

import { User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SettingsProfile() {
	const { data: session } = authClient.useSession();
	const [name, setName] = useState(session?.user?.name || "");
	const [isUpdating, setIsUpdating] = useState(false);

	const handleUpdateProfile = async () => {
		if (!name.trim()) {
			toast.error("Name cannot be empty");
			return;
		}

		setIsUpdating(true);
		try {
			// TODO: Implement profile update API call
			// For now, just show success toast
			toast.success("Profile updated successfully");
		} catch (_error) {
			toast.error("Failed to update profile");
		} finally {
			setIsUpdating(false);
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in space-y-8 duration-500">
			<div className="flex flex-col gap-1">
				<h3 className="font-semibold text-2xl tracking-tight">
					Profile Information
				</h3>
				<p className="text-muted-foreground text-sm">
					Update your personal details and how others see you.
				</p>
			</div>

			<div className="grid gap-8">
				{/* Avatar Section */}
				<div className="group relative flex flex-col items-start gap-8 overflow-hidden rounded-2xl border bg-card/30 p-8 backdrop-blur-sm md:flex-row md:items-center">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

					<div className="relative shrink-0">
						<Avatar className="h-28 w-28 border-2 border-muted shadow-2xl ring-4 ring-background transition-transform duration-500 group-hover:scale-105">
							<AvatarImage src={session?.user?.image || undefined} />
							<AvatarFallback className="bg-primary font-bold text-3xl text-primary-foreground">
								{session?.user?.name ? getInitials(session.user.name) : "U"}
							</AvatarFallback>
						</Avatar>
						<div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background shadow-lg">
							<User className="h-4 w-4 text-primary" />
						</div>
					</div>

					<div className="relative space-y-2">
						<h4 className="font-bold text-xl">Profile Picture</h4>
						<p className="max-w-[400px] text-muted-foreground text-sm leading-relaxed">
							Your avatar is automatically synced from your connected account.
							This helps keep your identity consistent across the platform.
						</p>
						<Button
							variant="outline"
							size="sm"
							className="mt-2 h-8 font-semibold text-xs uppercase tracking-wider"
						>
							Refetch Avatar
						</Button>
					</div>
				</div>

				{/* Fields Section */}
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					<div className="space-y-3">
						<Label
							htmlFor="name"
							className="ml-1 font-semibold text-foreground/80 text-sm uppercase tracking-tight"
						>
							Full Name
						</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							className="h-12 rounded-lg border-muted-foreground/20 bg-background/50 text-base transition-all focus:border-primary/50 focus:ring-primary/20"
						/>
						<p className="ml-1 text-[11px] text-muted-foreground">
							Preferably your real name for professional contexts.
						</p>
					</div>

					<div className="space-y-3">
						<Label
							htmlFor="email"
							className="ml-1 font-semibold text-foreground/80 text-sm uppercase tracking-tight"
						>
							Email Address
						</Label>
						<div className="relative">
							<Input
								id="email"
								value={session?.user?.email || ""}
								disabled
								className="h-12 rounded-lg border-muted-foreground/30 border-dashed bg-muted/40 pr-24 text-muted-foreground"
							/>
							<div className="absolute top-1.5 right-2">
								<Badge
									variant={
										session?.user?.emailVerified ? "default" : "secondary"
									}
									className={cn(
										"h-9 border-none px-3 font-medium transition-colors",
										session?.user?.emailVerified
											? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
											: "bg-amber-500/10 text-amber-600",
									)}
								>
									{session?.user?.emailVerified ? "Verified" : "Pending"}
								</Badge>
							</div>
						</div>
						<p className="ml-1 text-[11px] text-muted-foreground">
							Account email cannot be modified directly.
						</p>
					</div>
				</div>

				<div className="flex items-center justify-between rounded-2xl border bg-muted/10 p-6">
					<div className="space-y-1">
						<p className="font-medium">Unsaved Changes</p>
						<p className="text-muted-foreground text-xs">
							Don't forget to save your profile updates.
						</p>
					</div>
					<Button
						onClick={handleUpdateProfile}
						disabled={isUpdating || name === session?.user?.name}
						className="h-11 rounded-xl px-10 font-bold shadow-primary/20 shadow-xl transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98]"
					>
						{isUpdating ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</div>
		</div>
	);
}
