"use client";

import { AlertTriangle, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function SettingsSecurity() {
	const [showPasswordDialog, setShowPasswordDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const handleChangePassword = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			toast.error("All fields are required");
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}

		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		setIsChangingPassword(true);
		try {
			// TODO: Implement password change API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success("Password changed successfully");
			setShowPasswordDialog(false);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (_error) {
			toast.error("Failed to change password");
		} finally {
			setIsChangingPassword(false);
		}
	};

	const handleDeleteAccount = async () => {
		// TODO: Implement account deletion API call
		toast.error("Account deletion is not yet implemented");
		setShowDeleteDialog(false);
	};

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in space-y-10 duration-500">
			<div className="flex flex-col gap-1">
				<h3 className="font-semibold text-2xl tracking-tight tracking-tight">
					Security & Account
				</h3>
				<p className="text-muted-foreground text-sm">
					Manage your authentication methods and project security settings.
				</p>
			</div>

			<div className="grid gap-12">
				{/* Password Section */}
				<div className="space-y-6">
					<Label className="ml-1 font-bold text-muted-foreground text-sm uppercase tracking-widest">
						Authentication Control
					</Label>
					<div className="group flex flex-col items-start justify-between gap-4 rounded-2xl border bg-card/40 p-6 shadow-sm backdrop-blur-sm transition-all hover:bg-card/60 sm:flex-row sm:items-center">
						<div className="flex items-center gap-4">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-transform group-hover:rotate-6 group-hover:scale-110">
								<Shield className="h-7 w-7 text-primary" />
							</div>
							<div className="space-y-1">
								<h4 className="font-bold text-lg">Account Password</h4>
								<p className="max-w-[240px] text-muted-foreground text-xs leading-relaxed">
									Modify your current password to keep your account secure.
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							onClick={() => setShowPasswordDialog(true)}
							className="h-12 w-full rounded-xl px-8 font-bold transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground sm:w-auto"
						>
							Change Password
						</Button>
					</div>
				</div>

				<Separator className="opacity-50" />

				{/* Danger Zone Section */}
				<div className="space-y-6">
					<div className="ml-1 flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-4 w-4" />
						<Label className="font-bold text-sm uppercase tracking-widest">
							Danger Zone
						</Label>
					</div>
					<div className="group relative space-y-6 overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
						<div className="pointer-events-none absolute top-0 right-0 p-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]">
							<AlertTriangle className="h-32 w-32 text-destructive" />
						</div>

						<div className="relative space-y-2">
							<h4 className="font-bold font-serif text-destructive text-xl">
								Terminate Account
							</h4>
							<p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
								Deleting your account is permanent. All your presales projects,
								AI models configurations, and generated proposals will be
								permanently deleted from our database.
							</p>
						</div>

						<div className="relative pt-2">
							<Button
								variant="destructive"
								onClick={() => setShowDeleteDialog(true)}
								className="h-12 rounded-xl px-10 font-extrabold shadow-destructive/20 shadow-lg transition-all hover:scale-[1.02] hover:shadow-destructive/40 active:scale-[0.98]"
							>
								Erase My Account Forever
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Change Password Dialog */}
			<Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change Password</DialogTitle>
						<DialogDescription>
							Enter your current password and choose a new one
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="current-password">Current Password</Label>
							<Input
								id="current-password"
								type="password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="new-password">New Password</Label>
							<Input
								id="new-password"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm New Password</Label>
							<Input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowPasswordDialog(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleChangePassword}
							disabled={isChangingPassword}
						>
							{isChangingPassword ? "Changing..." : "Change Password"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Account Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your
							account and remove all your data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteAccount}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete Account
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
