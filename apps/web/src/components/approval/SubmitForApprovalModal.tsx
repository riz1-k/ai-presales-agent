"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

interface SubmitForApprovalModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
	onSuccess?: () => void;
}

export function SubmitForApprovalModal({
	open,
	onOpenChange,
	projectId,
	onSuccess,
}: SubmitForApprovalModalProps) {
	const [message, setMessage] = useState("");

	// Validate project
	// Validate project
	const { data: validation, isLoading: isValidating } = useQuery({
		...trpc.approvals.validateProject.queryOptions({ projectId }),
		enabled: open,
	});

	// Submit mutation
	const submitMutation = useMutation(
		trpc.approvals.submitForApproval.mutationOptions({
			onSuccess: () => {
				toast.success("Project submitted for approval!");
				onOpenChange(false);
				setMessage("");
				onSuccess?.();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}),
	);

	const handleSubmit = () => {
		submitMutation.mutate({
			projectId,
			message: message || undefined,
		});
	};

	const canSubmit = validation?.valid && !submitMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Submit for Approval</DialogTitle>
					<DialogDescription>
						Submit this project for review by an approver
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Validation Status */}
					{isValidating ? (
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Validating project...</span>
						</div>
					) : validation ? (
						<div className="space-y-3">
							{/* Errors */}
							{validation.errors.length > 0 && (
								<div className="rounded-lg border border-red-200 bg-red-50 p-3">
									<div className="flex items-start gap-2">
										<AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
										<div className="flex-1">
											<p className="font-medium text-red-900 text-sm">
												Required fields missing
											</p>
											<ul className="mt-2 space-y-1 text-red-700 text-sm">
												{validation.errors.map((error: string, _i: number) => (
													<li key={error}>• {error}</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							)}

							{/* Warnings */}
							{validation.warnings.length > 0 && (
								<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
									<div className="flex items-start gap-2">
										<AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
										<div className="flex-1">
											<p className="font-medium text-sm text-yellow-900">
												Recommendations
											</p>
											<ul className="mt-2 space-y-1 text-sm text-yellow-700">
												{validation.warnings.map(
													(warning: string, _i: number) => (
														<li key={warning}>• {warning}</li>
													),
												)}
											</ul>
										</div>
									</div>
								</div>
							)}

							{/* Success */}
							{validation.valid && validation.warnings.length === 0 && (
								<div className="rounded-lg border border-green-200 bg-green-50 p-3">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 text-green-600" />
										<p className="text-green-900 text-sm">
											Project is ready for approval
										</p>
									</div>
								</div>
							)}
						</div>
					) : null}

					{/* Optional Message */}
					<div className="space-y-2">
						<Label htmlFor="message">Message to Reviewer (Optional)</Label>
						<Textarea
							id="message"
							placeholder="Add any notes or context for the reviewer..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={3}
							disabled={!validation?.valid}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={submitMutation.isPending}
					>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!canSubmit}>
						{submitMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Submitting...
							</>
						) : (
							<>
								<Send className="mr-2 h-4 w-4" />
								Submit for Approval
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
