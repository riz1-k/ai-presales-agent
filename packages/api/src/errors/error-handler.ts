import { TRPCError } from "@trpc/server";
import {
	AIServiceError,
	DatabaseError,
	NetworkError,
	NotFoundError,
	RateLimitError,
	UnauthorizedError,
	ValidationError,
	isCustomError,
} from "./error-types";

export interface ErrorResponse {
	code: string;
	message: string;
	details?: unknown;
	retryable?: boolean;
}

/**
 * Central error handler that converts errors to standardized format
 */
export function handleError(error: unknown): ErrorResponse {
	// Handle custom errors
	if (isCustomError(error)) {
		if (error instanceof ValidationError) {
			return {
				code: "VALIDATION_ERROR",
				message: error.message,
				details: error.details
					? { field: error.field, ...(typeof error.details === "object" ? error.details : {}) }
					: { field: error.field },
				retryable: false,
			};
		}

		if (error instanceof NotFoundError) {
			return {
				code: "NOT_FOUND",
				message: error.message,
				details: { resource: error.resource, id: error.id },
				retryable: false,
			};
		}

		if (error instanceof UnauthorizedError) {
			return {
				code: "UNAUTHORIZED",
				message: error.message,
				retryable: false,
			};
		}

		if (error instanceof AIServiceError) {
			return {
				code: "AI_SERVICE_ERROR",
				message: error.message,
				details: { provider: error.provider },
				retryable: error.retryable,
			};
		}

		if (error instanceof RateLimitError) {
			return {
				code: "RATE_LIMIT_EXCEEDED",
				message: error.message,
				details: { retryAfter: error.retryAfter },
				retryable: true,
			};
		}

		if (error instanceof DatabaseError) {
			return {
				code: "DATABASE_ERROR",
				message: "A database error occurred",
				details: { operation: error.operation },
				retryable: true,
			};
		}

		if (error instanceof NetworkError) {
			return {
				code: "NETWORK_ERROR",
				message: error.message,
				details: { statusCode: error.statusCode },
				retryable: true,
			};
		}
	}

	// Handle tRPC errors
	if (error instanceof TRPCError) {
		return {
			code: error.code,
			message: error.message,
			details: error.cause,
			retryable: error.code === "TIMEOUT" || error.code === "INTERNAL_SERVER_ERROR",
		};
	}

	// Handle standard errors
	if (error instanceof Error) {
		return {
			code: "INTERNAL_ERROR",
			message: error.message,
			retryable: false,
		};
	}

	// Unknown error
	return {
		code: "UNKNOWN_ERROR",
		message: "An unknown error occurred",
		details: error,
		retryable: false,
	};
}

/**
 * Convert error to user-friendly message
 */
export function getUserFriendlyMessage(error: unknown): string {
	const handled = handleError(error);

	const friendlyMessages: Record<string, string> = {
		VALIDATION_ERROR: "Please check your input and try again",
		NOT_FOUND: "The requested resource was not found",
		UNAUTHORIZED: "You don't have permission to perform this action",
		AI_SERVICE_ERROR:
			"AI service is temporarily unavailable. Please try again",
		RATE_LIMIT_EXCEEDED: "Too many requests. Please wait a moment",
		DATABASE_ERROR: "A database error occurred. Please try again",
		NETWORK_ERROR: "Network error. Please check your connection",
		INTERNAL_ERROR: "An internal error occurred. Please try again",
		UNKNOWN_ERROR: "Something went wrong. Please try again",
	};

	return friendlyMessages[handled.code] || handled.message;
}

/**
 * Log error with context
 */
export function logError(
	error: unknown,
	context?: Record<string, unknown>,
): void {
	const handled = handleError(error);

	console.error("[ERROR]", {
		code: handled.code,
		message: handled.message,
		details: handled.details,
		retryable: handled.retryable,
		context,
		timestamp: new Date().toISOString(),
		stack: error instanceof Error ? error.stack : undefined,
	});
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: {
		maxRetries?: number;
		initialDelay?: number;
		maxDelay?: number;
		shouldRetry?: (error: unknown) => boolean;
	} = {},
): Promise<T> {
	const {
		maxRetries = 3,
		initialDelay = 1000,
		maxDelay = 10000,
		shouldRetry = (error) => {
			const handled = handleError(error);
			return handled.retryable ?? false;
		},
	} = options;

	let lastError: unknown;
	let delay = initialDelay;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (attempt === maxRetries || !shouldRetry(error)) {
				throw error;
			}

			// Wait before retry
			await new Promise((resolve) => setTimeout(resolve, delay));

			// Exponential backoff
			delay = Math.min(delay * 2, maxDelay);

			logError(error, { attempt, nextDelay: delay });
		}
	}

	throw lastError;
}
