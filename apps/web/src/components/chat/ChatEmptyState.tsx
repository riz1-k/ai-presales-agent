"use client";

import { MessageSquarePlus, Sparkles } from "lucide-react";

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
		<div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-6 py-12">
			{/* Brand / Logo */}
			<div className="group relative mb-8 transition-all hover:scale-105">
				<div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-chart-3 shadow-2xl ring-4 ring-background">
					<MessageSquarePlus className="h-12 w-12 text-white transition-transform group-hover:rotate-12" />
				</div>
				<div className="absolute -top-3 -right-3 flex h-10 w-10 animate-bounce items-center justify-center rounded-full bg-chart-1 text-white shadow-lg ring-2 ring-background">
					<Sparkles className="h-5 w-5" />
				</div>
			</div>

			{/* Title & Description */}
			<div className="mb-12 max-w-md text-center">
				<h2 className="mb-3 font-bold text-3xl tracking-tight lg:text-4xl">
					How can I help you today?
				</h2>
				<p className="text-lg text-muted-foreground leading-relaxed">
					I'll help you scope projects, generate proposals, and estimate
					resources with AI accuracy.
				</p>
			</div>

			{/* Suggestions Grid */}
			<div className="w-full max-w-2xl">
				<p className="mb-4 text-center font-medium text-muted-foreground text-sm uppercase tracking-widest">
					Get Started Fast
				</p>
				<div className="grid gap-4 sm:grid-cols-2">
					{suggestions.map((suggestion) => (
						<button
							key={suggestion}
							type="button"
							className="group relative flex h-full flex-col items-start justify-between rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl dark:hover:bg-muted/30"
							onClick={() => onSuggestionClick?.(suggestion)}
						>
							<div className="mb-8 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
								<Sparkles className="h-4 w-4" />
							</div>
							<p className="font-medium text-foreground transition-colors group-hover:text-primary">
								{suggestion}
							</p>
							<div className="absolute right-4 bottom-4 opacity-0 transition-opacity group-hover:opacity-100">
								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
									<MessageSquarePlus className="h-3 w-3" />
								</div>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
