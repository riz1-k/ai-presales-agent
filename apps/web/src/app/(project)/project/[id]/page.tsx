"use client";

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
import { useProjectChat } from "@/hooks/useProjectChat";

interface ProjectPageProps {
	params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
	const { id: projectId } = use(params);

	// Project state - will be replaced with tRPC queries
	const [projectName, setProjectName] = useState("New Project");
	const [activeTab, setActiveTab] = useState<DocumentTabType>("proposal");

	// Mock document data - will be replaced with real data
	const [documents] = useState({
		proposal: null as string | null,
		resource_plan: null as string | null,
		wbs: null as string | null,
	});

	// Use project chat hook for AI conversation
	const { messages, isLoading, isLoadingHistory, error, sendMessage } =
		useProjectChat({ projectId });

	// Render document content based on active tab
	const renderDocumentContent = (tab: DocumentTabType) => {
		switch (tab) {
			case "proposal":
				return <ProposalView content={documents.proposal} />;
			case "resource_plan":
				return <ResourceView content={documents.resource_plan} />;
			case "wbs":
				return <WBSView content={documents.wbs} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Project Header */}
			<ProjectHeader
				projectName={projectName}
				status="draft"
				onNameChange={setProjectName}
			/>

			{/* Main content - split view */}
			<div className="flex flex-1 overflow-hidden">
				{/* Chat Panel (left side) */}
				<div className="flex w-1/2 flex-col border-border border-r lg:w-[45%]">
					{/* Chat messages */}
					<div className="flex-1 overflow-hidden">
						{isLoadingHistory ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-muted-foreground">
									Loading conversation...
								</div>
							</div>
						) : messages.length === 0 ? (
							<ChatEmptyState onSuggestionClick={sendMessage} />
						) : (
							<ChatContainer isLoading={isLoading}>
								{messages.map((message) => {
									// Extract text content from message
									const getContent = () => {
										if ("parts" in message && message.parts) {
											return message.parts
												.map((part) => (part.type === "text" ? part.text : ""))
												.join("");
										}
										if (
											"content" in message &&
											typeof message.content === "string"
										) {
											return message.content;
										}
										return "";
									};

									const content = getContent();

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

					{/* Error display */}
					{error && (
						<div className="border-destructive border-t bg-destructive/10 px-4 py-2 text-destructive text-sm">
							Error: {error.message}
						</div>
					)}

					{/* Chat input */}
					<ChatInput
						onSend={sendMessage}
						disabled={isLoading || isLoadingHistory}
					/>
				</div>

				{/* Document Panel (right side) */}
				<div className="flex w-1/2 flex-col lg:w-[55%]">
					<DocumentTabs activeTab={activeTab} onTabChange={setActiveTab}>
						{renderDocumentContent}
					</DocumentTabs>
				</div>
			</div>
		</div>
	);
}
