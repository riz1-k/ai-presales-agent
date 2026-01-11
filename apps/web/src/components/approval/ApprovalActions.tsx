"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MessageSquare, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

interface ApprovalActionsProps {
	projectId: string;
	projectName: string;
	onSuccess?: () => void;
}

export function ApprovalActions({
	projectId,
	projectName,
	onSuccess,
}: ApprovalActionsProps) {
	const [showApproveDialog, setShowApproveDialog] = useState(false);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [showChangesDialog, setShowChangesDialog] = useState(false);

	const [approveComments, setApproveComments] = useState("");
	const [rejectReason, setRejectReason] = useState("");
	const [changesComments, setChangesComments] = useState("");
	const [requestedChanges, setRequestedChanges] = useState<
		{ id: string; content: string }[]
	>([{ id: Math.random().toString(36).substr(2, 9), content: "" }]);

	const approveMutation = useMutation(
		trpc.approvals.approveProject.mutationOptions({
			onSuccess: () => {
				toast.success("Project approved!");
				setShowApproveDialog(false);
				setApproveComments("");
				onSuccess?.();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const rejectMutation = useMutation(
		trpc.approvals.rejectProject.mutationOptions({
			onSuccess: () => {
				toast.success("Project rejected");
				setShowRejectDialog(false);
				setRejectReason("");
				onSuccess?.();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const changesMutation = useMutation(
		trpc.approvals.requestChanges.mutationOptions({
			onSuccess: () => {
				toast.success("Changes requested");
				setShowChangesDialog(false);
				setChangesComments("");
				setRequestedChanges([
					{ id: Math.random().toString(36).substr(2, 9), content: "" },
				]);
				onSuccess?.();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const handleApprove = () => {
		approveMutation.mutate({
			projectId,
			comments: approveComments || undefined,
		});
	};

	const handleReject = () => {
		if (!rejectReason.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}
		rejectMutation.mutate({
			projectId,
			reason: rejectReason,
		});
	};

	const handleRequestChanges = () => {
		if (!changesComments.trim()) {
			toast.error("Please provide comments");
			return;
		}
		const validChanges = requestedChanges
			.map((c) => c.content)
			.filter((c) => c.trim() !== "");
		if (validChanges.length === 0) {
			toast.error("Please add at least one change request");
			return;
		}
		changesMutation.mutate({
			projectId,
			comments: changesComments,
			requestedChanges: validChanges,
		});
	};

	const addChangeRequest = () => {
		setRequestedChanges([
			...requestedChanges,
			{ id: Math.random().toString(36).substr(2, 9), content: "" },
		]);
	};

	const updateChangeRequest = (id: string, value: string) => {
		setRequestedChanges(
			requestedChanges.map((rc) =>
				rc.id === id ? { ...rc, content: value } : rc,
			),
		);
	};

	const removeChangeRequest = (id: string) => {
		setRequestedChanges(requestedChanges.filter((rc) => rc.id !== id));
	};

	return (
		<>
			<div className="flex items-center gap-2">
				<Button variant="outline" onClick={() => setShowChangesDialog(true)}>
					<MessageSquare className="mr-2 h-4 w-4" />
					Request Changes
				</Button>

				<Button
					variant="outline"
					onClick={() => setShowRejectDialog(true)}
					className="text-red-600 hover:text-red-700"
				>
					<XCircle className="mr-2 h-4 w-4" />
					Reject
				</Button>

				<Button onClick={() => setShowApproveDialog(true)}>
					<CheckCircle2 className="mr-2 h-4 w-4" />
					Approve
				</Button>
			</div>

			{/* Approve Dialog */}
			<Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Approve Project</DialogTitle>
						<DialogDescription>
							Approve "{projectName}" for finalization
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="approve-comments">Comments (Optional)</Label>
							<Textarea
								id="approve-comments"
								placeholder="Add any comments or feedback..."
								value={approveComments}
								onChange={(e) => setApproveComments(e.target.value)}
								rows={3}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowApproveDialog(false)}
							disabled={approveMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleApprove}
							disabled={approveMutation.isPending}
						>
							{approveMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Approving...
								</>
							) : (
								"Approve Project"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Dialog */}
			<Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Project</DialogTitle>
						<DialogDescription>
							Reject "{projectName}" and return to draft
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="reject-reason">
								Reason for Rejection <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="reject-reason"
								placeholder="Explain why this project is being rejected..."
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								rows={4}
								required
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowRejectDialog(false)}
							disabled={rejectMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleReject}
							disabled={rejectMutation.isPending}
						>
							{rejectMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Rejecting...
								</>
							) : (
								"Reject Project"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Request Changes Dialog */}
			<Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Request Changes</DialogTitle>
						<DialogDescription>
							Request specific changes to "{projectName}"
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="changes-comments">
								Comments <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="changes-comments"
								placeholder="Provide overall feedback..."
								value={changesComments}
								onChange={(e) => setChangesComments(e.target.value)}
								rows={3}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label>
								Requested Changes <span className="text-red-500">*</span>
							</Label>
							<div className="space-y-2">
								{requestedChanges.map((change, index) => (
									<div key={change.id} className="flex items-center gap-2">
										<Input
											placeholder={`Change request ${index + 1}`}
											value={change.content}
											onChange={(e) =>
												updateChangeRequest(change.id, e.target.value)
											}
										/>
										{requestedChanges.length > 1 && (
											<Button
												variant="outline"
												size="icon"
												onClick={() => removeChangeRequest(change.id)}
											>
												<XCircle className="h-4 w-4" />
											</Button>
										)}
									</div>
								))}
								<Button
									variant="outline"
									size="sm"
									onClick={addChangeRequest}
									className="w-full"
								>
									Add Change Request
								</Button>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowChangesDialog(false)}
							disabled={changesMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleRequestChanges}
							disabled={changesMutation.isPending}
						>
							{changesMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Requesting...
								</>
							) : (
								"Request Changes"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
