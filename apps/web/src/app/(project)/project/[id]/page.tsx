"use client";

import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { use, useState } from "react";
import { Streamdown } from "streamdown";
import {
	ChatContainer,
	ChatEmptyState,
	ChatInput,
	ChatMessage,
} from "@/components/chat";
import {
	DocumentTabs,
	type DocumentTabType,
	ProposalView,
	ResourceView,
	WBSView,
} from "@/components/documents";
import { ProjectHeader } from "@/components/project";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocuments, useExtractedData, useProjectChat } from "@/hooks";

interface ProjectPageProps {
	params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
	const { id: projectId } = use(params);

	// Project state
	const [projectName, setProjectName] = useState("New Project");
	const [activeTab, setActiveTab] = useState<DocumentTabType>("proposal");

	// Hooks
	const {
		messages,
		isLoading,
		isLoadingHistory,
		error: chatError,
		sendMessage,
	} = useProjectChat({ projectId });

	const { data: extractedData, isLoading: isLoadingExtracted } =
		useExtractedData({ projectId, pollInterval: 3000 });

	const {
		documents,
		isGenerating,
		generateDocuments,
		isLoading: isLoadingDocs,
	} = useDocuments({ projectId });

	// Render document content based on active tab
	const renderDocumentContent = (tab: DocumentTabType) => {
		const commonProps = {
			extractedData,
			generatedDocuments: documents,
			isLoading: isLoadingExtracted || isLoadingDocs,
		};

		switch (tab) {
			case "proposal":
				return <ProposalView {...commonProps} />;
			case "resource_plan":
				return <ResourceView {...commonProps} />;
			case "wbs":
				return <WBSView {...commonProps} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex h-full flex-col bg-muted/20">
			{/* Project Header */}
			<ProjectHeader
				projectName={extractedData?.info?.projectName || projectName}
				status="draft"
				onNameChange={setProjectName}
			/>

			{/* Main content - split view */}
			<div className="flex flex-1 gap-0 overflow-hidden p-0">
				{/* Chat Panel (left side) */}
				<div className="flex w-1/2 flex-col border-border border-r bg-background lg:w-[45%]">
					{/* Panel Header */}
					<div className="flex items-center border-border border-b bg-muted/30 px-4 py-3">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
							<span className="font-semibold text-foreground/80 text-sm uppercase lowercase tracking-tight">
								Project Intelligence
							</span>
						</div>
					</div>

					<div className="flex-1 overflow-hidden">
						{isLoadingHistory ? (
							<div className="flex h-full flex-col items-center justify-center p-8 text-center">
								<Loader2 className="mb-4 h-12 w-12 animate-spin text-primary/20" />
								<div className="animate-pulse font-medium text-muted-foreground">
									Syncing with AI Agent...
								</div>
							</div>
						) : messages.length === 0 ? (
							<ChatEmptyState onSuggestionClick={sendMessage} />
						) : (
							<ChatContainer isLoading={isLoading}>
								{messages.map((message) => {
									const content =
										"parts" in message && message.parts
											? message.parts
													.map((p) => (p.type === "text" ? p.text : ""))
													.join("")
											: "content" in message &&
													typeof message.content === "string"
												? message.content
												: "";

									return (
										<ChatMessage
											key={message.id}
											id={message.id}
											role={message.role as "user" | "assistant" | "system"}
											content={
												message.role === "assistant" ? (
													<Streamdown isAnimating={isLoading}>
														{content}
													</Streamdown>
												) : (
													content
												)
											}
											status="sent"
										/>
									);
								})}
							</ChatContainer>
						)}
					</div>

					{chatError && (
						<div className="border-destructive/20 border-t bg-destructive/5 px-4 py-2 text-destructive text-xs">
							<span className="font-semibold">Connection Error:</span>{" "}
							{chatError.message}
						</div>
					)}

					<ChatInput
						onSend={sendMessage}
						disabled={isLoading || isLoadingHistory}
					/>
				</div>

				{/* Document Panel (right side) */}
				<div className="relative flex w-1/2 flex-col lg:w-[55%]">
					<DocumentTabs
						activeTab={activeTab}
						onTabChange={setActiveTab}
						actions={
							<Button
								size="sm"
								variant={documents ? "outline" : "default"}
								className="h-8 gap-2 shadow-sm"
								disabled={isGenerating || !extractedData}
								onClick={generateDocuments}
							>
								{isGenerating ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : documents ? (
									<RotateCcw className="h-3.5 w-3.5" />
								) : (
									<Sparkles className="h-3.5 w-3.5" />
								)}
								{isGenerating
									? "Generating..."
									: documents
										? "Regenerate Docs"
										: "Generate Final Docs"}
							</Button>
						}
					>
						{renderDocumentContent}
					</DocumentTabs>

					{/* Simple overlay for generation state */}
					{isGenerating && (
						<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
							<Card className="w-[300px] border-primary/20 p-6 text-center shadow-xl">
								<Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
								<h3 className="mb-1 font-semibold text-lg">
									AI is composing...
								</h3>
								<p className="text-muted-foreground text-xs">
									Creating professional versions of your proposal, resource
									plan, and WBS.
								</p>
							</Card>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
