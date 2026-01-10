"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatContainerProps {
	children: ReactNode;
	isLoading?: boolean;
}

export function ChatContainer({
	children,
	isLoading = false,
}: ChatContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const [showScrollButton, setShowScrollButton] = useState(false);

	// Check if user has scrolled up
	const handleScroll = () => {
		if (!containerRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
		const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
		setShowScrollButton(!isNearBottom);
	};

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		if (!showScrollButton) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when children change
	}, [children, showScrollButton]);

	const scrollToBottom = () => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div className="relative flex h-full flex-col">
			{/* Messages container */}
			<div
				ref={containerRef}
				onScroll={handleScroll}
				className="flex-1 space-y-6 overflow-y-auto px-4 py-6"
			>
				{children}

				{/* Loading indicator */}
				{isLoading && (
					<div className="flex gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-chart-1 to-chart-3 font-medium text-sm text-white">
							AI
						</div>
						<div className="max-w-[80%] space-y-2 rounded-2xl border border-border bg-secondary/50 px-4 py-3">
							<p className="font-medium text-muted-foreground text-xs">
								AI Assistant
							</p>
							<div className="space-y-2">
								<Skeleton className="h-4 w-[250px]" />
								<Skeleton className="h-4 w-[200px]" />
								<Skeleton className="h-4 w-[150px]" />
							</div>
						</div>
					</div>
				)}

				<div ref={bottomRef} />
			</div>

			{/* Scroll to bottom button */}
			{showScrollButton && (
				<Button
					variant="secondary"
					size="icon"
					className="absolute right-4 bottom-4 h-10 w-10 rounded-full shadow-lg transition-all hover:shadow-xl"
					onClick={scrollToBottom}
				>
					<ChevronDown className="h-5 w-5" />
				</Button>
			)}
		</div>
	);
}
