"use client";

import { Loader2, Send } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
	onSend: (message: string) => void;
	disabled?: boolean;
	placeholder?: string;
}

export function ChatInput({
	onSend,
	disabled = false,
	placeholder = "Type your message...",
}: ChatInputProps) {
	const [value, setValue] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
		// biome-ignore lint/correctness/useExhaustiveDependencies: resize when value changes
	}, [value]);

	const handleSubmit = () => {
		const trimmed = value.trim();
		if (!trimmed || disabled) return;
		onSend(trimmed);
		setValue("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Submit on Enter (without Shift)
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div className="border-border border-t bg-background/80 p-4 backdrop-blur-sm">
			<div className="flex items-end gap-3">
				<div className="relative flex-1">
					<textarea
						ref={textareaRef}
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={disabled}
						rows={1}
						className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						style={{
							minHeight: "48px",
							maxHeight: "200px",
						}}
					/>
					{/* Character count (optional) */}
					{value.length > 0 && (
						<span className="absolute right-14 bottom-1 text-muted-foreground text-xs">
							{value.length}
						</span>
					)}
				</div>

				<Button
					size="icon"
					onClick={handleSubmit}
					disabled={disabled || !value.trim()}
					className="h-12 w-12 shrink-0 rounded-xl transition-all hover:scale-105"
				>
					{disabled ? (
						<Loader2 className="h-5 w-5 animate-spin" />
					) : (
						<Send className="h-5 w-5" />
					)}
				</Button>
			</div>

			{/* Keyboard hint */}
			<p className="mt-2 text-center text-muted-foreground text-xs">
				Press{" "}
				<kbd className="rounded bg-muted px-1 py-0.5 font-mono">Enter</kbd> to
				send,{" "}
				<kbd className="rounded bg-muted px-1 py-0.5 font-mono">
					Shift + Enter
				</kbd>{" "}
				for new line
			</p>
		</div>
	);
}
