import { useCallback, useEffect, useRef, useState } from "react";

export interface AutoSaveOptions {
	debounceMs?: number;
	onSave: () => Promise<void> | void;
	onError?: (error: Error) => void;
}

export interface AutoSaveStatus {
	status: "idle" | "saving" | "saved" | "error";
	lastSaved: Date | null;
	error: Error | null;
}

/**
 * Hook for auto-saving data with debouncing
 * Automatically saves after a period of inactivity
 */
export function useAutoSave<T>(
	data: T,
	options: AutoSaveOptions,
): AutoSaveStatus {
	const { debounceMs = 30000, onSave, onError } = options;

	const [status, setStatus] = useState<AutoSaveStatus["status"]>("idle");
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const previousDataRef = useRef<T>(data);
	const isSavingRef = useRef(false);

	const save = useCallback(async () => {
		if (isSavingRef.current) return;

		try {
			isSavingRef.current = true;
			setStatus("saving");
			setError(null);

			await onSave();

			setStatus("saved");
			setLastSaved(new Date());
			previousDataRef.current = data;
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			setStatus("error");
			setError(error);
			onError?.(error);
		} finally {
			isSavingRef.current = false;
		}
	}, [data, onSave, onError]);

	// Debounced auto-save
	useEffect(() => {
		// Check if data has changed
		if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
			return;
		}

		// Clear existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Set new timeout
		timeoutRef.current = setTimeout(() => {
			save();
		}, debounceMs);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [data, debounceMs, save]);

	// Save on window blur (user switching tabs)
	useEffect(() => {
		const handleBlur = () => {
			if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
				save();
			}
		};

		window.addEventListener("blur", handleBlur);
		return () => window.removeEventListener("blur", handleBlur);
	}, [data, save]);

	// Save before page unload
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
				// Attempt synchronous save
				save();

				// Show warning
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [data, save]);

	return {
		status,
		lastSaved,
		error,
	};
}
