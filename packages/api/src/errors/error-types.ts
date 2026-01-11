/**
 * Custom error types for the application
 */

export class ValidationError extends Error {
	constructor(
		public field: string,
		message: string,
		public details?: unknown,
	) {
		super(message);
		this.name = "ValidationError";
	}
}

export class NotFoundError extends Error {
	constructor(
		public resource: string,
		public id?: string,
	) {
		super(`${resource}${id ? ` with id ${id}` : ""} not found`);
		this.name = "NotFoundError";
	}
}

export class UnauthorizedError extends Error {
	constructor(message = "Unauthorized access") {
		super(message);
		this.name = "UnauthorizedError";
	}
}

export class AIServiceError extends Error {
	constructor(
		message: string,
		public provider?: string,
		public retryable = true,
	) {
		super(message);
		this.name = "AIServiceError";
	}
}

export class RateLimitError extends Error {
	constructor(
		public retryAfter?: number,
		message = "Rate limit exceeded",
	) {
		super(message);
		this.name = "RateLimitError";
	}
}

export class DatabaseError extends Error {
	constructor(
		message: string,
		public operation?: string,
	) {
		super(message);
		this.name = "DatabaseError";
	}
}

export class NetworkError extends Error {
	constructor(
		message = "Network error occurred",
		public statusCode?: number,
	) {
		super(message);
		this.name = "NetworkError";
	}
}

/**
 * Type guard to check if error is a known custom error
 */
export function isCustomError(
	error: unknown,
): error is
	| ValidationError
	| NotFoundError
	| UnauthorizedError
	| AIServiceError
	| RateLimitError
	| DatabaseError
	| NetworkError {
	return (
		error instanceof ValidationError ||
		error instanceof NotFoundError ||
		error instanceof UnauthorizedError ||
		error instanceof AIServiceError ||
		error instanceof RateLimitError ||
		error instanceof DatabaseError ||
		error instanceof NetworkError
	);
}
