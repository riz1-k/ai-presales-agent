"use client";

import { use, useCallback, useState } from "react";
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

// Mock data for demonstration - will be replaced with real data
interface Message {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
	status: "sending" | "sent" | "error";
}

interface ProjectPageProps {
	params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
	use(params);

	// Mock project state - will be replaced with tRPC queries
	const [projectName, setProjectName] = useState("New Project");
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<DocumentTabType>("proposal");

	// Mock document data
	const [documents] = useState({
		proposal: null as string | null,
		resource_plan: null as string | null,
		wbs: null as string | null,
	});

	// Handle sending messages (mock for now)
	const handleSendMessage = useCallback((content: string) => {
		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: "user",
			content,
			timestamp: new Date(),
			status: "sent",
		};

		setMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);

		// Simulate AI response
		setTimeout(() => {
			const aiMessage: Message = {
				id: crypto.randomUUID(),
				role: "assistant",
				content: `Thank you for sharing that! I'm gathering information about your project. Let me ask you a few questions to help create a comprehensive proposal.\n\nCould you tell me more about:\n1. The main goals or objectives of this project?\n2. Who is the target audience?\n3. Are there any specific technical requirements or preferences?`,
				timestamp: new Date(),
				status: "sent",
			};
			setMessages((prev) => [...prev, aiMessage]);
			setIsLoading(false);
		}, 1500);
	}, []);

	// Handle suggestion click from empty state
	const handleSuggestionClick = useCallback(
		(suggestion: string) => {
			handleSendMessage(suggestion);
		},
		[handleSendMessage],
	);

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
						{messages.length === 0 ? (
							<ChatEmptyState onSuggestionClick={handleSuggestionClick} />
						) : (
							<ChatContainer isLoading={isLoading}>
								{messages.map((message) => (
									<ChatMessage
										key={message.id}
										id={message.id}
										role={message.role}
										content={
											message.role === "assistant" ? (
												<Streamdown isAnimating={false}>
													{message.content}
												</Streamdown>
											) : (
												message.content
											)
										}
										timestamp={message.timestamp}
										status={message.status}
									/>
								))}
							</ChatContainer>
						)}
					</div>

					{/* Chat input */}
					<ChatInput onSend={handleSendMessage} disabled={isLoading} />
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
