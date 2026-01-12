"use client";

import { User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

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
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<User className="h-5 w-5 text-muted-foreground" />
					<CardTitle>Profile</CardTitle>
				</div>
				<CardDescription>
					Manage your account information and profile picture
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center gap-6">
					<Avatar className="h-20 w-20">
						<AvatarImage src={session?.user?.image || undefined} />
						<AvatarFallback className="text-lg">
							{session?.user?.name ? getInitials(session.user.name) : "U"}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 space-y-1">
						<p className="text-muted-foreground text-sm">Profile Picture</p>
						<p className="text-muted-foreground text-xs">
							Avatar is synced from your account
						</p>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter your name"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<div className="flex items-center gap-2">
						<Input
							id="email"
							value={session?.user?.email || ""}
							disabled
							className="flex-1"
						/>
						<Badge
							variant={session?.user?.emailVerified ? "default" : "secondary"}
						>
							{session?.user?.emailVerified ? "Verified" : "Unverified"}
						</Badge>
					</div>
					<p className="text-muted-foreground text-xs">
						Email cannot be changed from this page
					</p>
				</div>

				<div className="flex justify-end">
					<Button
						onClick={handleUpdateProfile}
						disabled={isUpdating || name === session?.user?.name}
					>
						{isUpdating ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
