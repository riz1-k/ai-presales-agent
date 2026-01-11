"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApprovalActions } from "@/components/approval/ApprovalActions";
import { ApprovalStatus } from "@/components/approval/ApprovalStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export default function ApprovalsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProject, setSelectedProject] = useState<string | null>(null);

	const {
		data: pendingProjects,
		isLoading,
		refetch,
	} = useQuery(trpc.approvals.getPendingApprovals.queryOptions());

	const filteredProjects = pendingProjects?.filter((project) =>
		project.projectName.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const formatDate = (date: Date | string) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(new Date(date));
	};

	const handleSuccess = () => {
		refetch();
		setSelectedProject(null);
	};

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-bold text-3xl">Pending Approvals</h1>
				<p className="mt-2 text-muted-foreground">
					Review and approve projects submitted for approval
				</p>
			</div>

			<div className="mb-6">
				<div className="relative">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : filteredProjects && filteredProjects.length > 0 ? (
				<div className="space-y-4">
					{filteredProjects.map((project) => (
						<Card key={project.id} className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="mb-2 flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
											<FileText className="h-5 w-5 text-primary" />
										</div>
										<div>
											<h3 className="font-semibold text-lg">
												{project.projectName}
											</h3>
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
												<span>Submitted by {project.user?.name}</span>
												<span>•</span>
												<span>{formatDate(project.updatedAt)}</span>
											</div>
										</div>
									</div>

									<div className="mt-4">
										<ApprovalStatus status={project.status} />
									</div>

									{project.approvals && project.approvals.length > 0 && (
										<div className="mt-4 rounded-md bg-muted p-3">
											<p className="mb-1 font-medium text-sm">
												Submission Message:
											</p>
											<p className="text-muted-foreground text-sm">
												{project.approvals[0].comments || "No message provided"}
											</p>
										</div>
									)}
								</div>

								<div className="ml-4 flex flex-col gap-2">
									<Link href={`/ai?projectId=${project.id}`}>
										<Button variant="outline" size="sm">
											View Project
										</Button>
									</Link>
								</div>
							</div>

							<div className="mt-6 flex items-center justify-between border-t pt-4">
								<p className="text-muted-foreground text-sm">
									Project ID: {project.id.slice(0, 8)}...
								</p>

								<ApprovalActions
									projectId={project.id}
									projectName={project.projectName}
									onSuccess={handleSuccess}
								/>
							</div>
						</Card>
					))}
				</div>
			) : (
				<div className="flex h-64 flex-col items-center justify-center text-center">
					<FileText className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
					<h3 className="mb-2 font-semibold text-lg">No pending approvals</h3>
					<p className="text-muted-foreground text-sm">
						{searchQuery
							? "Try a different search term"
							: "All projects have been reviewed"}
					</p>
				</div>
			)}
		</div>
	);
}
