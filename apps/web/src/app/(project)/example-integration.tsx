/**
 * Example: Integrating State Persistence into a Project Page
 *
 * This example shows how to add auto-save, recovery, and version control
 * to an existing project page.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RecoveryModal } from "@/components/save-status/RecoveryModal";
import { SaveIndicator } from "@/components/save-status/SaveIndicator";
import { VersionHistory } from "@/components/save-status/VersionHistory";
import { Button } from "@/components/ui/button";
import { useAutoSave, useRecovery } from "@/hooks";
import { trpc } from "@/lib/trpc";

interface ProjectData {
	projectName: string;
	description: string;
	requirements: string[];
	// ... other fields
}

export default function ProjectPageExample({
	projectId,
}: {
	projectId: string;
}) {
	// State
	const [projectData, setProjectData] = useState<ProjectData>({
		projectName: "",
		description: "",
		requirements: [],
	});
	const [showVersionHistory, setShowVersionHistory] = useState(false);

	// Queries
	const queryClient = useQueryClient();
	const { data: project } = useQuery(
		trpc.projects.getById.queryOptions({ projectId }),
	);
	const { data: versions } = useQuery(
		trpc.projects.getVersions.queryOptions({ projectId }),
	);

	// Mutations
	const createVersion = useMutation(
		trpc.projects.createVersion.mutationOptions({
			onSuccess: () => {
				toast.success("Version saved!");
				queryClient.invalidateQueries({
					queryKey: trpc.projects.getVersions.queryKey({ projectId }),
				});
			},
		}),
	);

	const restoreVersion = useMutation(
		trpc.projects.restoreVersion.mutationOptions({
			onSuccess: () => {
				toast.success("Version restored!");
				// Reload project data
				queryClient.invalidateQueries({
					queryKey: trpc.projects.getById.queryKey({ projectId }),
				});
			},
		}),
	);

	const updateProjectMutation = useMutation(
		trpc.projects.updateProjectData.mutationOptions(),
	);

	// Auto-save hook
	const saveStatus = useAutoSave(projectData, {
		debounceMs: 30000, // 30 seconds
		onSave: async () => {
			// Convert project data to changes format
			const changes: Record<string, string> = {
				projectName: projectData.projectName,
				description: projectData.description,
				requirements: JSON.stringify(projectData.requirements),
			};

			await updateProjectMutation.mutateAsync({
				projectId,
				changes,
				changeSource: "manual_edit",
				createVersion: false, // Don't auto-create versions
			});
		},
		onError: (error) => {
			toast.error(`Auto-save failed: ${error.message}`);
		},
	});

	// Recovery hook
	const recovery = useRecovery({
		key: `project-${projectId}`,
		data: projectData,
		enabled: true,
		saveIntervalMs: 10000, // 10 seconds
		onRecover: (data) => {
			setProjectData(data);
			toast.success("Unsaved work recovered!");
		},
	});

	// Manual save version
	const handleSaveVersion = async () => {
		await createVersion.mutate({
			projectId,
			changeSummary: "Manual save",
			completenessScore: calculateCompleteness(projectData),
		});
	};

	// Calculate completeness (example)
	const calculateCompleteness = (data: ProjectData): number => {
		let score = 0;
		if (data.projectName) score += 33;
		if (data.description) score += 33;
		if (data.requirements.length > 0) score += 34;
		return score;
	};

	return (
		<div className="flex h-screen flex-col">
			{/* Header with save controls */}
			<header className="border-b bg-background px-6 py-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-2xl">
							{projectData.projectName || "Untitled Project"}
						</h1>
						<SaveIndicator status={saveStatus} />
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowVersionHistory(true)}
						>
							<History className="mr-2 h-4 w-4" />
							Version History
						</Button>

						<Button
							size="sm"
							onClick={handleSaveVersion}
							disabled={createVersion.isPending}
						>
							<Save className="mr-2 h-4 w-4" />
							Save Version
						</Button>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-4xl space-y-6">
					{/* Project Name */}
					<div>
						<label className="mb-2 block font-medium text-sm">
							Project Name
						</label>
						<input
							type="text"
							value={projectData.projectName}
							onChange={(e) =>
								setProjectData((prev) => ({
									...prev,
									projectName: e.target.value,
								}))
							}
							className="w-full rounded-md border px-3 py-2"
							placeholder="Enter project name..."
						/>
					</div>

					{/* Description */}
					<div>
						<label className="mb-2 block font-medium text-sm">
							Description
						</label>
						<textarea
							value={projectData.description}
							onChange={(e) =>
								setProjectData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							className="w-full rounded-md border px-3 py-2"
							rows={4}
							placeholder="Enter project description..."
						/>
					</div>

					{/* Requirements */}
					<div>
						<label className="mb-2 block font-medium text-sm">
							Requirements
						</label>
						<div className="space-y-2">
							{projectData.requirements.map((req, index) => (
								<div key={index} className="flex items-center gap-2">
									<input
										type="text"
										value={req}
										onChange={(e) => {
											const newReqs = [...projectData.requirements];
											newReqs[index] = e.target.value;
											setProjectData((prev) => ({
												...prev,
												requirements: newReqs,
											}));
										}}
										className="flex-1 rounded-md border px-3 py-2"
									/>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											const newReqs = projectData.requirements.filter(
												(_, i) => i !== index,
											);
											setProjectData((prev) => ({
												...prev,
												requirements: newReqs,
											}));
										}}
									>
										Remove
									</Button>
								</div>
							))}
							<Button
								variant="outline"
								onClick={() =>
									setProjectData((prev) => ({
										...prev,
										requirements: [...prev.requirements, ""],
									}))
								}
							>
								Add Requirement
							</Button>
						</div>
					</div>
				</div>
			</main>

			{/* Recovery Modal */}
			<RecoveryModal
				open={recovery.showRecoveryModal}
				onRecover={recovery.recover}
				onDiscard={recovery.clearRecovery}
				lastModified={recovery.lastModified}
			/>

			{/* Version History Modal */}
			<VersionHistory
				open={showVersionHistory}
				onOpenChange={setShowVersionHistory}
				versions={versions || []}
				onRestore={(versionId) => restoreVersion.mutate({ versionId })}
				isRestoring={restoreVersion.isPending}
			/>
		</div>
	);
}
