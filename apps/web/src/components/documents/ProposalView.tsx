"use client";

import {
	Calendar,
	DollarSign,
	FileText,
	Info,
	Sparkles,
	Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExtractedProjectData, GeneratedDocuments } from "@/hooks";

interface ProposalViewProps {
	extractedData?: ExtractedProjectData | null;
	generatedDocuments?: GeneratedDocuments | null;
	isLoading?: boolean;
}

export function ProposalView({
	extractedData,
	generatedDocuments,
	isLoading = false,
}: ProposalViewProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				<Skeleton className="h-8 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
				<div className="pt-4">
					<Skeleton className="h-6 w-1/2" />
					<Skeleton className="mt-2 h-4 w-full" />
					<Skeleton className="mt-1 h-4 w-full" />
					<Skeleton className="mt-1 h-4 w-3/4" />
				</div>
			</div>
		);
	}

	const proposal = generatedDocuments?.proposal;
	const info = extractedData?.info;
	const timelineBudget = extractedData?.timelineBudget;

	// Check if there's any meaningful data to display
	const hasData =
		proposal ||
		info?.projectName ||
		info?.projectDescription ||
		info?.objectives?.length ||
		timelineBudget?.budgetMin ||
		timelineBudget?.durationWeeks;

	if (!hasData) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
					<FileText className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mb-2 font-medium text-lg">No Proposal Data Yet</h3>
				<p className="max-w-sm text-muted-foreground text-sm">
					Start chatting with the AI to generate project information. Data will
					be automatically extracted from your conversation.
				</p>
				<div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
					<Sparkles className="h-4 w-4" />
					<span>AI-extracted content will appear here</span>
				</div>
			</div>
		);
	}

	// If we have AI-generated document sections, show those
	if (proposal?.sections && proposal.sections.length > 0) {
		return (
			<div className="space-y-8 p-6">
				<div className="flex items-center justify-between">
					<h2 className="font-bold text-3xl tracking-tight">
						{proposal.title}
					</h2>
					<Badge variant="outline" className="flex items-center gap-1">
						<Sparkles className="h-3 w-3" />
						AI Generated
					</Badge>
				</div>

				<div className="space-y-12">
					{proposal.sections.map((section) => (
						<section key={section.id} className="space-y-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<h3 className="font-semibold text-xl">{section.title}</h3>
								{section.isAIGenerated && (
									<Badge variant="secondary" className="h-4 text-[10px]">
										AI
									</Badge>
								)}
							</div>
							<div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/80 leading-relaxed">
								{section.content}
							</div>
						</section>
					))}
				</div>
			</div>
		);
	}

	// Fallback to basic extracted data view
	return (
		<div className="space-y-6 p-6">
			<div className="mb-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
				<div className="flex items-center gap-2 text-primary text-sm">
					<Info className="h-4 w-4" />
					<span>
						This is a draft view based on extracted facts. Click "Generate" for
						a professional proposal.
					</span>
				</div>
			</div>

			{/* Project Overview */}
			{(info?.projectName ||
				info?.projectDescription ||
				info?.problemStatement) && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Project Overview
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{info.projectName && (
							<div>
								<h4 className="font-medium text-muted-foreground text-sm">
									Project Name
								</h4>
								<p className="font-semibold text-lg">{info.projectName}</p>
							</div>
						)}
						{info.clientName && (
							<div>
								<h4 className="font-medium text-muted-foreground text-sm">
									Client
								</h4>
								<p>
									{info.clientName}
									{info.clientCompany && ` - ${info.clientCompany}`}
								</p>
							</div>
						)}
						{info.projectDescription && (
							<div>
								<h4 className="font-medium text-muted-foreground text-sm">
									Description
								</h4>
								<p className="text-foreground/80">{info.projectDescription}</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Objectives */}
			{info?.objectives && info.objectives.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Target className="h-5 w-5" />
							Objectives
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							{info.objectives.map((objective, index) => (
								<li key={index} className="flex items-start gap-2">
									<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
										{index + 1}
									</span>
									<span>{objective}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}

			{/* Timeline & Budget */}
			{(timelineBudget?.budgetMin ||
				timelineBudget?.budgetMax ||
				timelineBudget?.durationWeeks) && (
				<div className="grid gap-4 md:grid-cols-2">
					{(timelineBudget.budgetMin || timelineBudget.budgetMax) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<DollarSign className="h-4 w-4" />
									Budget
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="font-bold text-2xl">
									{timelineBudget.budgetCurrency || "USD"}{" "}
									{timelineBudget.budgetMin?.toLocaleString()}
									{timelineBudget.budgetMax &&
										timelineBudget.budgetMin !== timelineBudget.budgetMax &&
										` - ${timelineBudget.budgetMax.toLocaleString()}`}
								</p>
							</CardContent>
						</Card>
					)}

					{timelineBudget.durationWeeks && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<Calendar className="h-4 w-4" />
									Timeline
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="font-bold text-2xl">
									{timelineBudget.durationWeeks} weeks
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}
