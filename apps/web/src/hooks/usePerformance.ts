import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook to measure component render performance
 */
export function useRenderPerformance(
	componentName: string,
	enabled = process.env.NODE_ENV === "development",
) {
	const renderCount = useRef(0);
	const lastRenderTime = useRef(performance.now());

	useEffect(() => {
		if (!enabled) return;

		renderCount.current += 1;
		const now = performance.now();
		const timeSinceLastRender = now - lastRenderTime.current;
		lastRenderTime.current = now;

		console.log(`[Performance] ${componentName}`, {
			renderCount: renderCount.current,
			timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`,
		});
	});
}

/**
 * Hook to detect unnecessary re-renders
 */
export function useWhyDidYouUpdate(
	name: string,
	props: Record<string, unknown>,
) {
	const previousProps = useRef<Record<string, unknown>>(null);

	useEffect(() => {
		if (previousProps.current) {
			const allKeys = Object.keys({ ...previousProps.current, ...props });
			const changedProps: Record<string, { from: unknown; to: unknown }> = {};

			allKeys.forEach((key) => {
				if (previousProps.current![key] !== props[key]) {
					changedProps[key] = {
						from: previousProps.current![key],
						to: props[key],
					};
				}
			});

			if (Object.keys(changedProps).length > 0) {
				console.log(`[WhyDidYouUpdate] ${name}`, changedProps);
			}
		}

		previousProps.current = props;
	});
}

/**
 * Hook to debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

/**
 * Hook to throttle a function
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
	callback: T,
	delay: number,
): T {
	const lastRun = useRef(Date.now());

	return useCallback(
		(...args: Parameters<T>) => {
			const now = Date.now();
			if (now - lastRun.current >= delay) {
				lastRun.current = now;
				return callback(...args);
			}
		},
		[callback, delay],
	) as T;
}
