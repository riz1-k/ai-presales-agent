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
import { cn } from "@/lib/utils";
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
		<div className="container mx-auto max-w-6xl px-4 py-12">
			<div className="flex flex-col gap-12">
				{/* Header Section */}
				<div className="fade-in slide-in-from-top-4 flex animate-in flex-col items-start justify-between gap-6 duration-700 sm:flex-row sm:items-end">
					<div className="space-y-2">
						<h1 className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text font-bold text-5xl text-transparent tracking-tight">
							Projects
						</h1>
						<p className="max-w-md text-lg text-muted-foreground">
							Your AI-powered workspace for high-impact presales proposals.
						</p>
					</div>
					<Button
						onClick={() => setIsCreating(true)}
						className="h-12 gap-2 rounded-xl px-6 font-bold shadow-primary/20 shadow-xl transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98]"
					>
						<Plus className="h-5 w-5" />
						New Project
					</Button>
				</div>

				{/* Create Project Card (Inline Form) */}
				{isCreating && (
					<div className="fade-in slide-in-from-top-6 animate-in duration-500 ease-out">
						<Card className="group relative overflow-hidden rounded-3xl border-primary/30 bg-primary/5 shadow-2xl backdrop-blur-md">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
							<CardHeader className="relative">
								<CardTitle className="text-2xl">
									Initialize New Project
								</CardTitle>
								<CardDescription className="text-base">
									Define your project scope to begin collaborating with the AI
									agent.
								</CardDescription>
							</CardHeader>
							<CardContent className="relative pb-8">
								<form
									onSubmit={handleCreateProject}
									className="flex flex-col gap-4 sm:flex-row"
								>
									<Input
										placeholder="e.g. Acme Enterprise SaaS Migration"
										value={newProjectName}
										onChange={(e) => setNewProjectName(e.target.value)}
										className="h-14 flex-1 rounded-2xl border-muted-foreground/20 bg-background/80 px-6 text-lg transition-all focus:ring-primary/20"
										autoFocus
									/>
									<div className="flex gap-3">
										<Button
											type="submit"
											disabled={createProjectMutation.isPending}
											className="h-14 rounded-2xl px-8 font-bold shadow-lg"
										>
											{createProjectMutation.isPending
												? "Initializing..."
												: "Create Project"}
										</Button>
										<Button
											type="button"
											variant="ghost"
											onClick={() => setIsCreating(false)}
											className="h-14 rounded-2xl px-6 font-semibold hover:bg-background/50"
										>
											Cancel
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Projects List */}
				<section className="fade-in slide-in-from-bottom-4 animate-in delay-150 duration-700">
					<div className="mb-8 flex items-center justify-between">
						<h2 className="flex items-center gap-3 font-bold text-2xl tracking-tight">
							<Layout className="h-6 w-6 text-primary" />
							Recent Work
						</h2>
						{projectsQuery.data && projectsQuery.data.length > 0 && (
							<span className="rounded-full bg-muted/50 px-3 py-1 font-bold text-muted-foreground text-xs uppercase tracking-widest">
								{projectsQuery.data.length} Projects
							</span>
						)}
					</div>

					{projectsQuery.isLoading ? (
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="h-48 w-full animate-pulse rounded-3xl border border-muted bg-muted/20"
								/>
							))}
						</div>
					) : projectsQuery.data?.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-muted-foreground/20 border-dashed bg-muted/5 p-20 text-center backdrop-blur-sm">
							<div className="mb-8 flex h-24 w-24 rotate-3 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-primary/20 transition-transform duration-500 hover:rotate-0">
								<FileText className="h-12 w-12 text-primary" />
							</div>
							<h3 className="font-bold text-2xl tracking-tight">
								Your workspace is empty
							</h3>
							<p className="mt-3 mb-10 max-w-sm text-lg text-muted-foreground leading-relaxed">
								Kickstart your presales journey by creating your first project
								proposal with our AI assistant.
							</p>
							<Button
								variant="outline"
								onClick={() => setIsCreating(true)}
								className="h-12 rounded-xl border-muted-foreground/30 px-8 font-bold shadow-lg transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
							>
								Start First Project
							</Button>
						</div>
					) : (
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{projectsQuery.data?.map((project, idx) => (
								<Link
									key={project.id}
									href={`/project/${project.id}`}
									className="group perspective"
									style={{ animationDelay: `${idx * 100}ms` }}
								>
									<Card className="relative h-full overflow-hidden rounded-3xl border-muted-foreground/10 bg-card/50 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:border-primary/50 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]">
										<div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
											<FileText className="h-16 w-16" />
										</div>
										<CardHeader className="pt-8 pb-4">
											<div className="flex flex-col gap-4">
												<Badge
													variant="secondary"
													className={cn(
														"w-fit rounded-full border-none px-3 py-1 font-bold text-[10px] uppercase tracking-widest",
														project.status === "approved" ||
															project.status === "finalized"
															? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
															: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
													)}
												>
													{project.status.replace("_", " ")}
												</Badge>
												<CardTitle className="font-bold text-xl leading-tight transition-colors group-hover:text-primary">
													{project.projectName}
												</CardTitle>
											</div>
											<CardDescription className="flex items-center gap-2 pt-2 font-medium">
												<Clock className="h-3.5 w-3.5 text-muted-foreground" />
												<span className="text-xs">
													{new Date(project.updatedAt).toLocaleDateString(
														undefined,
														{
															month: "short",
															day: "numeric",
															year: "numeric",
														},
													)}
												</span>
											</CardDescription>
										</CardHeader>
										<CardContent className="pb-8">
											<div className="flex translate-y-2 items-center font-bold text-primary text-xs uppercase tracking-widest opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
												Access Workspace
												<ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
