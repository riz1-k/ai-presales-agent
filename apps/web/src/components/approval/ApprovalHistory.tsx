"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import {
	CheckCircle2,
	Clock,
	Loader2,
	MessageSquare,
	XCircle,
} from "lucide-react";

interface ApprovalHistoryProps {
	projectId: string;
}

export function ApprovalHistory({ projectId }: ApprovalHistoryProps) {
	const { data: history, isLoading } = useQuery(
		trpc.approvals.getApprovalHistory.queryOptions({
			projectId,
		}),
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!history || history.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
				<p>No approval history yet</p>
			</div>
		);
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "approved":
				return <CheckCircle2 className="h-5 w-5 text-green-600" />;
			case "rejected":
				return <XCircle className="h-5 w-5 text-red-600" />;
			case "changes_requested":
				return <MessageSquare className="h-5 w-5 text-orange-600" />;
			case "pending":
				return <Clock className="h-5 w-5 text-yellow-600" />;
			default:
				return <Clock className="h-5 w-5 text-gray-600" />;
		}
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
			approved: { label: "Approved", variant: "default" },
			rejected: { label: "Rejected", variant: "destructive" },
			changes_requested: { label: "Changes Requested", variant: "outline" },
			pending: { label: "Pending", variant: "secondary" },
		};

		const config = variants[status] || { label: status, variant: "secondary" };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const formatDate = (date: Date | string) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(new Date(date));
	};

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Approval History</h3>

			<div className="relative space-y-4">
				{/* Timeline line */}
				<div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border" />

				{history.map((approval, index) => (
					<Card key={approval.id} className="relative pl-12 p-4">
						{/* Timeline dot */}
						<div className="absolute left-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-background">
							{getStatusIcon(approval.status)}
						</div>

						<div className="space-y-2">
							<div className="flex items-start justify-between">
								<div>
									<div className="flex items-center gap-2">
										{getStatusBadge(approval.status)}
										<span className="text-sm text-muted-foreground">
											{formatDate(approval.createdAt)}
										</span>
									</div>
									<p className="mt-1 text-sm font-medium">
										{approval.approver?.name || "Unknown"}
									</p>
									<p className="text-xs text-muted-foreground">
										{approval.approver?.email}
									</p>
								</div>
							</div>

							{approval.comments && (
								<div className="rounded-md bg-muted p-3">
									<p className="text-sm">{approval.comments}</p>
								</div>
							)}

							{approval.requestedChanges &&
								approval.requestedChanges.length > 0 && (
									<div className="rounded-md border border-orange-200 bg-orange-50 p-3">
										<p className="text-sm font-medium text-orange-900 mb-2">
											Requested Changes:
										</p>
										<ul className="space-y-1 text-sm text-orange-700">
											{approval.requestedChanges.map((change: string, i: number) => (
												<li key={i} className="flex items-start gap-2">
													<span className="text-orange-500 mt-0.5">•</span>
													<span>{change}</span>
												</li>
											))}
										</ul>
									</div>
								)}

							{approval.updatedAt &&
								new Date(approval.updatedAt).getTime() !==
									new Date(approval.createdAt).getTime() && (
									<p className="text-xs text-muted-foreground">
										Updated: {formatDate(approval.updatedAt)}
									</p>
								)}
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
