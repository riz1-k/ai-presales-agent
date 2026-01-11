"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface NetworkErrorProps {
	onRetry?: () => void;
	message?: string;
}

export function NetworkError({
	onRetry,
	message = "You appear to be offline. Please check your internet connection.",
}: NetworkErrorProps) {
	const [isOnline, setIsOnline] = useState(true);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		setIsOnline(navigator.onLine);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	if (isOnline) {
		return null;
	}

	return (
		<Card className="border-orange-200 bg-orange-50 p-4">
			<div className="flex items-start gap-3">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
					<WifiOff className="h-4 w-4 text-orange-600" />
				</div>
				<div className="flex-1">
					<h3 className="font-medium text-orange-900">No Internet Connection</h3>
					<p className="mt-1 text-sm text-orange-700">{message}</p>
					{onRetry && (
						<Button
							variant="outline"
							size="sm"
							onClick={onRetry}
							className="mt-3"
						>
							Retry
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}
