import { useEffect, useState } from "react";

interface RecoveryData<T> {
	data: T;
	timestamp: number;
}

export interface UseRecoveryOptions<T> {
	key: string;
	data: T;
	enabled?: boolean;
	saveIntervalMs?: number;
	onRecover?: (data: T) => void;
}

/**
 * Hook for local storage backup and recovery
 * Saves data to localStorage periodically and checks for recovery on mount
 */
export function useRecovery<T>({
	key,
	data,
	enabled = true,
	saveIntervalMs = 10000, // 10 seconds
	onRecover,
}: UseRecoveryOptions<T>) {
	const [showRecoveryModal, setShowRecoveryModal] = useState(false);
	const [recoveryData, setRecoveryData] = useState<RecoveryData<T> | null>(
		null,
	);

	// Check for recovery data on mount
	useEffect(() => {
		if (!enabled) return;

		try {
			const stored = localStorage.getItem(key);
			if (stored) {
				const parsed = JSON.parse(stored) as RecoveryData<T>;
				// Only show recovery if data is less than 24 hours old
				const age = Date.now() - parsed.timestamp;
				if (age < 24 * 60 * 60 * 1000) {
					setRecoveryData(parsed);
					setShowRecoveryModal(true);
				} else {
					// Clear old data
					localStorage.removeItem(key);
				}
			}
		} catch (error) {
			console.error("Failed to check recovery data:", error);
		}
	}, [key, enabled]);

	// Periodic save to localStorage
	useEffect(() => {
		if (!enabled) return;

		const interval = setInterval(() => {
			try {
				const recoveryData: RecoveryData<T> = {
					data,
					timestamp: Date.now(),
				};
				localStorage.setItem(key, JSON.stringify(recoveryData));
			} catch (error) {
				console.error("Failed to save recovery data:", error);
			}
		}, saveIntervalMs);

		return () => clearInterval(interval);
	}, [key, data, enabled, saveIntervalMs]);

	const recover = () => {
		if (recoveryData && onRecover) {
			onRecover(recoveryData.data);
		}
		clearRecovery();
	};

	const clearRecovery = () => {
		setShowRecoveryModal(false);
		setRecoveryData(null);
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error("Failed to clear recovery data:", error);
		}
	};

	return {
		showRecoveryModal,
		recoveryData,
		recover,
		clearRecovery,
		lastModified: recoveryData ? new Date(recoveryData.timestamp) : undefined,
	};
}
