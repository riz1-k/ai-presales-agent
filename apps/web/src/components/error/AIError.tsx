"use client";

import { Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AIErrorProps {
	error: Error;
	onRetry?: () => void;
	onManualInput?: () => void;
}

export function AIError({ error, onRetry, onManualInput }: AIErrorProps) {
	const isRetryable =
		error.message.includes("timeout") ||
		error.message.includes("network") ||
		error.message.includes("temporarily");

	return (
		<Card className="border-red-200 bg-red-50 p-4">
			<div className="flex items-start gap-3">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
					<Bot className="h-4 w-4 text-red-600" />
				</div>
				<div className="flex-1">
					<h3 className="font-medium text-red-900">AI Service Error</h3>
					<p className="mt-1 text-red-700 text-sm">
						{isRetryable
							? "The AI service is temporarily unavailable. Please try again in a moment."
							: "An error occurred while processing your request. You can try again or enter the information manually."}
					</p>

					{process.env.NODE_ENV === "development" && (
						<details className="mt-2">
							<summary className="cursor-pointer text-red-600 text-xs">
								Error Details
							</summary>
							<pre className="mt-1 overflow-auto text-red-600 text-xs">
								{error.message}
							</pre>
						</details>
					)}

					<div className="mt-3 flex gap-2">
						{onRetry && (
							<Button
								variant="outline"
								size="sm"
								onClick={onRetry}
								className="border-red-300 text-red-700 hover:bg-red-100"
							>
								<RefreshCw className="mr-2 h-3 w-3" />
								Retry
							</Button>
						)}
						{onManualInput && (
							<Button
								variant="outline"
								size="sm"
								onClick={onManualInput}
								className="border-red-300 text-red-700 hover:bg-red-100"
							>
								Enter Manually
							</Button>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}
