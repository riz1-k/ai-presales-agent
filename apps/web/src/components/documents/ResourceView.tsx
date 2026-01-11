"use client";

import {
	Briefcase,
	Clock,
	DollarSign,
	Info,
	Sparkles,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneratedDocuments, ResourceTeamMember } from "@/hooks";

interface ResourceViewProps {
	generatedDocuments?: GeneratedDocuments | null;
	isLoading?: boolean;
}

const seniorityColors = {
	junior: "bg-green-500/20 text-green-600 dark:text-green-400",
	mid: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
	senior: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
	lead: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
};

const roleIcons: Record<string, string> = {
	project_manager: "📋",
	tech_lead: "🏗️",
	frontend_developer: "🎨",
	backend_developer: "⚙️",
	fullstack_developer: "💻",
	devops_engineer: "🚀",
	qa_engineer: "🔍",
	ui_ux_designer: "✨",
	business_analyst: "📊",
	scrum_master: "🔄",
};

export function ResourceView({
	generatedDocuments,
	isLoading = false,
}: ResourceViewProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				<Skeleton className="h-8 w-1/2" />
				<div className="grid gap-4 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-24" />
					))}
				</div>
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-20" />
					))}
				</div>
			</div>
		);
	}

	const resourcePlan = generatedDocuments?.resourcePlan;

	if (!resourcePlan || !resourcePlan.team || resourcePlan.team.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
					<Users className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mb-2 font-medium text-lg">No Resource Plan Yet</h3>
				<p className="max-w-sm text-muted-foreground text-sm">
					The AI will create a resource allocation plan based on your project
					requirements.
				</p>
				<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
					<Sparkles className="h-4 w-4" />
					<span>Resource allocation will appear here</span>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Summary Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
								<Users className="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<p className="font-bold text-2xl">
									{resourcePlan.totalHeadcount}
								</p>
								<p className="text-muted-foreground text-sm">Total Headcount</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
								<Clock className="h-5 w-5 text-purple-500" />
							</div>
							<div>
								<p className="font-bold text-2xl">
									{resourcePlan.totalHours.toLocaleString()}
								</p>
								<p className="text-muted-foreground text-sm">Total Hours</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{resourcePlan.estimatedCost && (
					<Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5">
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
									<DollarSign className="h-5 w-5 text-green-500" />
								</div>
								<div>
									<p className="font-bold text-2xl">
										${resourcePlan.estimatedCost.toLocaleString()}
									</p>
									<p className="text-muted-foreground text-sm">
										Estimated Cost
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Strategy Summary */}
			{resourcePlan.summary && (
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Sparkles className="h-4 w-4 text-primary" />
							Resource Strategy
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-foreground/80 text-sm italic leading-relaxed">
							{resourcePlan.summary}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Team Composition */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Briefcase className="h-5 w-5" />
						Team Composition
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{resourcePlan.team.map(
							(member: ResourceTeamMember, _index: number) => (
								<div
									key={member.role}
									className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
								>
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-2xl">
											{roleIcons[member.role] || "👤"}
										</div>
										<div>
											<div className="flex items-center gap-2">
												<h4 className="font-semibold">{member.roleLabel}</h4>
												<span className="rounded-full bg-primary/20 px-2 py-0.5 font-medium text-primary text-xs">
													×{member.count}
												</span>
											</div>
											<div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
												{member.allocationPercentage < 100 && (
													<span>{member.allocationPercentage}% allocation</span>
												)}
												{member.estimatedHours && (
													<span>{member.estimatedHours}h per person</span>
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-3">
										{member.seniorityLevel && (
											<Badge
												variant="secondary"
												className={`text-[10px] capitalize ${seniorityColors[member.seniorityLevel]}`}
											>
												{member.seniorityLevel}
											</Badge>
										)}
										{member.estimatedCost && (
											<span className="font-mono text-muted-foreground text-sm">
												$
												{(member.estimatedCost * member.count).toLocaleString()}
											</span>
										)}
									</div>
								</div>
							),
						)}
					</div>
				</CardContent>
			</Card>

			{/* Info Banner */}
			<div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/30 p-3 text-muted-foreground text-xs">
				<Info className="h-4 w-4 shrink-0" />
				<span>
					Team composition is estimated based on project scope, complexity, and
					industry standards. Actual staffing may vary based on availability and
					specific requirements.
				</span>
			</div>
		</div>
	);
}
