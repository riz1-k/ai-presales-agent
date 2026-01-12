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
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-5 w-5 text-muted-foreground" />
						<CardTitle>Account & Security</CardTitle>
					</div>
					<CardDescription>
						Manage your password and account security settings
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Password</Label>
								<p className="text-muted-foreground text-xs">
									Change your account password
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => setShowPasswordDialog(true)}
							>
								Change Password
							</Button>
						</div>
					</div>

					<Separator />

					<div className="space-y-3">
						<div className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							<h4 className="font-semibold">Danger Zone</h4>
						</div>
						<div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
							<div className="space-y-0.5">
								<Label>Delete Account</Label>
								<p className="text-muted-foreground text-xs">
									Permanently delete your account and all data
								</p>
							</div>
							<Button
								variant="destructive"
								onClick={() => setShowDeleteDialog(true)}
							>
								Delete Account
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

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
		</>
	);
}
