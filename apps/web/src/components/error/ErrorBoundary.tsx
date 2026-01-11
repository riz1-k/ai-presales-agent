"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error to console
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo);

		// TODO: Send to error tracking service (e.g., Sentry)
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	handleGoHome = () => {
		window.location.href = "/";
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div className="flex min-h-screen items-center justify-center p-4">
					<Card className="max-w-md p-6">
						<div className="flex flex-col items-center text-center">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
								<AlertCircle className="h-6 w-6 text-red-600" />
							</div>

							<h2 className="mb-2 text-xl font-semibold">
								Something went wrong
							</h2>

							<p className="mb-4 text-sm text-muted-foreground">
								We're sorry, but something unexpected happened. Please try
								refreshing the page or going back to the home page.
							</p>

							{process.env.NODE_ENV === "development" && this.state.error && (
								<details className="mb-4 w-full rounded-md bg-red-50 p-3 text-left">
									<summary className="cursor-pointer text-sm font-medium text-red-900">
										Error Details (Development Only)
									</summary>
									<pre className="mt-2 overflow-auto text-xs text-red-700">
										{this.state.error.message}
										{"\n\n"}
										{this.state.error.stack}
									</pre>
								</details>
							)}

							<div className="flex gap-2">
								<Button variant="outline" onClick={this.handleReset}>
									<RefreshCw className="mr-2 h-4 w-4" />
									Try Again
								</Button>
								<Button onClick={this.handleGoHome}>
									<Home className="mr-2 h-4 w-4" />
									Go Home
								</Button>
							</div>
						</div>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
