"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
	Copy,
	FileText,
	Loader2,
	MoreVertical,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function ProjectsPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

	const { data: projects, isLoading } = trpc.projects.list.useQuery();
	const createProject = trpc.projects.create.useMutation({
		onSuccess: (data) => {
			router.push(`/ai?projectId=${data.id}`);
		},
	});
	const duplicateProject = trpc.projects.duplicate.useMutation({
		onSuccess: () => {
			// Refetch projects list
			trpc.useContext().projects.list.invalidate();
		},
	});
	const deleteProject = trpc.projects.delete.useMutation({
		onSuccess: () => {
			trpc.useContext().projects.list.invalidate();
			setDeleteProjectId(null);
		},
	});

	const handleCreateProject = () => {
		createProject.mutate({ projectName: "Untitled Project" });
	};

	const handleDuplicate = (projectId: string) => {
		duplicateProject.mutate({ projectId });
	};

	const handleDelete = () => {
		if (deleteProjectId) {
			deleteProject.mutate({ projectId: deleteProjectId });
		}
	};

	const filteredProjects = projects?.filter((project) =>
		project.projectName.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "draft":
				return "bg-gray-100 text-gray-700";
			case "pending_approval":
				return "bg-yellow-100 text-yellow-700";
			case "approved":
				return "bg-green-100 text-green-700";
			case "finalized":
				return "bg-blue-100 text-blue-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const formatStatus = (status: string) => {
		return status
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(new Date(date));
	};

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Projects</h1>
					<p className="mt-2 text-muted-foreground">
						Manage your presales projects
					</p>
				</div>
				<Button onClick={handleCreateProject} disabled={createProject.isPending}>
					{createProject.isPending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Plus className="mr-2 h-4 w-4" />
					)}
					New Project
				</Button>
			</div>

			<div className="mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredProjects.map((project) => (
						<div
							key={project.id}
							className="group relative rounded-lg border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
						>
							<Link
								href={`/ai?projectId=${project.id}`}
								className="absolute inset-0 z-0"
							/>

							<div className="relative z-10 flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<div>
										<h3 className="font-semibold group-hover:text-primary">
											{project.projectName}
										</h3>
										<p className="text-xs text-muted-foreground">
											{formatDate(project.updatedAt)}
										</p>
									</div>
								</div>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="relative z-20"
											onClick={(e) => e.preventDefault()}
										>
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={(e) => {
												e.preventDefault();
												handleDuplicate(project.id);
											}}
											disabled={duplicateProject.isPending}
										>
											<Copy className="mr-2 h-4 w-4" />
											Duplicate
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) => {
												e.preventDefault();
												setDeleteProjectId(project.id);
											}}
											className="text-red-600"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<div className="mt-4">
								<span
									className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}
								>
									{formatStatus(project.status)}
								</span>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex h-64 flex-col items-center justify-center text-center">
					<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 text-lg font-semibold">No projects found</h3>
					<p className="mb-4 text-sm text-muted-foreground">
						{searchQuery
							? "Try a different search term"
							: "Get started by creating your first project"}
					</p>
					{!searchQuery && (
						<Button onClick={handleCreateProject}>
							<Plus className="mr-2 h-4 w-4" />
							Create Project
						</Button>
					)}
				</div>
			)}

			<AlertDialog
				open={deleteProjectId !== null}
				onOpenChange={() => setDeleteProjectId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Project</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this project? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							{deleteProject.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
