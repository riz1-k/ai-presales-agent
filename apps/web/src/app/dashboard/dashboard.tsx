"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronRight, Clock, FileText, Layout, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export default function Dashboard() {
	const router = useRouter();
	const [newProjectName, setNewProjectName] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	// Fetch projects
	const projectsQuery = useQuery(trpc.projects.list.queryOptions());

	// Create project mutation
	const createProjectMutation = useMutation(
		trpc.projects.create.mutationOptions({
			onSuccess: (data) => {
				router.push(`/project/${data.id}`);
			},
		}),
	);

	const handleCreateProject = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newProjectName.trim()) return;
		createProjectMutation.mutate({ projectName: newProjectName });
	};

	return (
		<div className="container mx-auto max-w-5xl px-4 py-8">
			<div className="flex flex-col gap-8">
				{/* Header Section */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">
							Project Dashboard
						</h1>
						<p className="mt-1 text-muted-foreground">
							Manage and create your presales project proposals.
						</p>
					</div>
					<Button onClick={() => setIsCreating(true)} className="gap-2">
						<Plus className="h-4 w-4" />
						New Project
					</Button>
				</div>

				{/* Create Project Card (Inline Form) */}
				{isCreating && (
					<Card className="fade-in slide-in-from-top-4 animate-in border-primary/20 bg-primary/5 duration-300">
						<CardHeader>
							<CardTitle>Create New Project</CardTitle>
							<CardDescription>
								Enter a name for your project to get started with the AI agent.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleCreateProject} className="flex gap-4">
								<Input
									placeholder="e.g. Acme Enterprise SaaS Migration"
									value={newProjectName}
									onChange={(e) => setNewProjectName(e.target.value)}
									className="flex-1"
									autoFocus
								/>
								<Button
									type="submit"
									disabled={createProjectMutation.isPending}
								>
									{createProjectMutation.isPending
										? "Creating..."
										: "Create Project"}
								</Button>
								<Button
									type="button"
									variant="ghost"
									onClick={() => setIsCreating(false)}
								>
									Cancel
								</Button>
							</form>
						</CardContent>
					</Card>
				)}

				{/* Projects List */}
				<section>
					<h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
						<Layout className="h-5 w-5 text-muted-foreground" />
						Recent Projects
					</h2>

					{projectsQuery.isLoading ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-40 w-full rounded-xl" />
							))}
						</div>
					) : projectsQuery.data?.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<FileText className="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 className="font-medium text-lg">No projects found</h3>
							<p className="mt-1 mb-6 max-w-xs text-muted-foreground text-sm">
								You haven't created any projects yet. Start by creating your
								first presales proposal.
							</p>
							<Button variant="outline" onClick={() => setIsCreating(true)}>
								Create your first project
							</Button>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{projectsQuery.data?.map((project) => (
								<Link key={project.id} href={`/project/${project.id}`}>
									<Card className="group h-full transition-colors hover:border-primary/50">
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between">
												<CardTitle className="truncate text-lg">
													{project.projectName}
												</CardTitle>
												<Badge
													variant="secondary"
													className="text-[10px] capitalize"
												>
													{project.status.replace("_", " ")}
												</Badge>
											</div>
											<CardDescription className="flex items-center gap-1.5 pt-1">
												<Clock className="h-3 w-3" />
												Updated{" "}
												{new Date(project.updatedAt).toLocaleDateString()}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="flex items-center font-medium text-primary text-sm transition-transform group-hover:translate-x-1">
												Open Project
												<ChevronRight className="ml-1 h-4 w-4" />
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
