"use client";

import { MessageSquarePlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatEmptyStateProps {
	onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
	"Tell me about a new software project you need to scope",
	"I have a mobile app idea I'd like to estimate",
	"Help me create a proposal for a client",
	"What information do you need from me to get started?",
];

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
	return (
		<div className="flex h-full flex-col items-center justify-center px-6 py-12">
			{/* Icon */}
			<div className="relative mb-6">
				<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1 to-chart-3 shadow-lg">
					<MessageSquarePlus className="h-10 w-10 text-white" />
				</div>
				<div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
					<Sparkles className="h-4 w-4" />
				</div>
			</div>

			{/* Title */}
			<h2 className="mb-2 font-semibold text-2xl">
				Welcome to AI Presales Agent
			</h2>
			<p className="mb-8 max-w-md text-center text-muted-foreground">
				I'll help you scope projects, create proposals, and estimate resources.
				Start by telling me about your project needs.
			</p>

			{/* Suggestions */}
			<div className="w-full max-w-lg space-y-3">
				<p className="text-center font-medium text-muted-foreground text-sm">
					Try one of these to get started:
				</p>
				<div className="grid gap-2">
					{suggestions.map((suggestion) => (
						<Button
							key={suggestion}
							variant="outline"
							className="h-auto justify-start whitespace-normal px-4 py-3 text-left text-sm hover:bg-secondary"
							onClick={() => onSuggestionClick?.(suggestion)}
						>
							<span className="line-clamp-2">{suggestion}</span>
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
