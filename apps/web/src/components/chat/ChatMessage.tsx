"use client";

import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
	id: string;
	role: "user" | "assistant" | "system";
	content: ReactNode;
	timestamp?: Date;
	status?: "sending" | "sent" | "error";
}

export function ChatMessage({
	role,
	content,
	timestamp,
	status = "sent",
}: ChatMessageProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		const text = typeof content === "string" ? content : "";
		if (text) {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const isUser = role === "user";

	return (
		<div
			className={`group relative flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
		>
			{/* Avatar */}
			<div
				className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium text-sm ${
					isUser
						? "bg-primary text-primary-foreground"
						: "bg-gradient-to-br from-chart-1 to-chart-3 text-white"
				}`}
			>
				{isUser ? "U" : "AI"}
			</div>

			{/* Message bubble */}
			<div
				className={`relative max-w-[80%] rounded-2xl px-4 py-3 ${
					isUser
						? "bg-primary text-primary-foreground"
						: "border border-border bg-secondary/50"
				}`}
			>
				{/* Role label */}
				<p
					className={`mb-1 font-medium text-xs ${
						isUser ? "text-primary-foreground/70" : "text-muted-foreground"
					}`}
				>
					{isUser ? "You" : "AI Assistant"}
				</p>

				{/* Content */}
				<div
					className={`text-sm leading-relaxed ${isUser ? "" : "prose prose-sm dark:prose-invert max-w-none"}`}
				>
					{content}
				</div>

				{/* Timestamp & status */}
				<div
					className={`mt-2 flex items-center gap-2 text-xs ${
						isUser ? "text-primary-foreground/60" : "text-muted-foreground"
					}`}
				>
					{timestamp && (
						<span>
							{timestamp.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					)}
					{status === "sending" && (
						<span className="animate-pulse">Sending...</span>
					)}
					{status === "error" && (
						<span className="text-destructive">Failed to send</span>
					)}
				</div>

				{/* Copy button (assistant messages only) */}
				{!isUser && (
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-2 -right-10 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
						onClick={handleCopy}
						title="Copy message"
					>
						{copied ? (
							<Check className="h-4 w-4 text-green-500" />
						) : (
							<Copy className="h-4 w-4" />
						)}
					</Button>
				)}
			</div>
		</div>
	);
}
