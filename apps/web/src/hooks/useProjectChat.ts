"use client";

import { env } from "@ai-presales-agent/env/web";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseProjectChatOptions {
	projectId: string;
}

/**
 * Custom hook wrapping useChat for project-scoped conversations
 */
export function useProjectChat({ projectId }: UseProjectChatOptions) {
	const [isLoadingHistory, setIsLoadingHistory] = useState(true);

	// Create transport with project ID in the body
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: `${env.NEXT_PUBLIC_SERVER_URL}/ai`,
				body: {
					projectId,
				},
			}),
		[projectId],
	);

	// Configure useChat with project context
	const chat = useChat({
		transport,
	});

	const { messages, setMessages, status, error, sendMessage } = chat;

	// Load conversation history on mount
	useEffect(() => {
		async function loadHistory() {
			try {
				const res = await fetch(
					`${env.NEXT_PUBLIC_SERVER_URL}/ai/history/${projectId}`,
				);
				if (res.ok) {
					const data = await res.json();
					const historyMessages = (data.messages || []).map(
						(msg: { role: string; content: string }, index: number) => ({
							id: `history-${index}`,
							role: msg.role as "user" | "assistant" | "system",
							content: msg.content,
							parts: [{ type: "text" as const, text: msg.content }],
						}),
					);
					if (historyMessages.length > 0) {
						setMessages(historyMessages);
					}
				}
			} catch (err) {
				console.error("Failed to load conversation history:", err);
			} finally {
				setIsLoadingHistory(false);
			}
		}

		loadHistory();
	}, [projectId, setMessages]);

	// Wrapper for sending message
	const handleSendMessage = useCallback(
		(text: string) => {
			sendMessage({ text });
		},
		[sendMessage],
	);

	// Clear conversation
	const clearConversation = useCallback(() => {
		setMessages([]);
	}, [setMessages]);

	return {
		// Messages
		messages,

		// State
		isLoading: status === "streaming" || status === "submitted",
		isLoadingHistory,
		error,

		// Actions
		sendMessage: handleSendMessage,
		clearConversation,
		setMessages,
	};
}
