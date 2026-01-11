import { RateLimitError } from "../errors/error-types";

interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Max requests per window
}

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar distributed cache
 */
class RateLimiter {
	private store = new Map<string, RateLimitEntry>();
	private cleanupInterval: NodeJS.Timeout;

	constructor() {
		// Cleanup expired entries every minute
		this.cleanupInterval = setInterval(() => {
			this.cleanup();
		}, 60000);
	}

	private cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.store.entries()) {
			if (entry.resetTime < now) {
				this.store.delete(key);
			}
		}
	}

	/**
	 * Check if request should be rate limited
	 */
	check(
		key: string,
		config: RateLimitConfig,
	): {
		allowed: boolean;
		remaining: number;
		resetTime: number;
	} {
		const now = Date.now();
		const entry = this.store.get(key);

		// No entry or expired entry
		if (!entry || entry.resetTime < now) {
			const resetTime = now + config.windowMs;
			this.store.set(key, { count: 1, resetTime });
			return {
				allowed: true,
				remaining: config.maxRequests - 1,
				resetTime,
			};
		}

		// Increment count
		entry.count += 1;

		// Check if limit exceeded
		if (entry.count > config.maxRequests) {
			return {
				allowed: false,
				remaining: 0,
				resetTime: entry.resetTime,
			};
		}

		return {
			allowed: true,
			remaining: config.maxRequests - entry.count,
			resetTime: entry.resetTime,
		};
	}

	/**
	 * Reset rate limit for a key
	 */
	reset(key: string): void {
		this.store.delete(key);
	}

	/**
	 * Cleanup on shutdown
	 */
	destroy(): void {
		clearInterval(this.cleanupInterval);
		this.store.clear();
	}
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
	// Per user limits
	USER_API: {
		windowMs: 60000, // 1 minute
		maxRequests: 60, // 60 requests per minute
	},
	USER_AI: {
		windowMs: 60000, // 1 minute
		maxRequests: 10, // 10 AI requests per minute
	},
	// Per project limits
	PROJECT_UPDATE: {
		windowMs: 60000, // 1 minute
		maxRequests: 30, // 30 updates per minute
	},
	// Authentication limits
	AUTH_LOGIN: {
		windowMs: 900000, // 15 minutes
		maxRequests: 5, // 5 login attempts per 15 minutes
	},
} as const;

/**
 * Rate limit middleware for tRPC
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
	return async (opts: { ctx: { session?: { user?: { id: string } } } }) => {
		const userId = opts.ctx.session?.user?.id;

		if (!userId) {
			// Skip rate limiting for unauthenticated requests
			// (they should be blocked by auth middleware anyway)
			return;
		}

		const key = `rate-limit:${userId}`;
		const result = rateLimiter.check(key, config);

		if (!result.allowed) {
			const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
			throw new RateLimitError(
				retryAfter,
				`Rate limit exceeded. Try again in ${retryAfter} seconds`,
			);
		}
	};
}

/**
 * Rate limit by IP address (for public endpoints)
 */
export function rateLimitByIP(ip: string, config: RateLimitConfig): void {
	const key = `rate-limit:ip:${ip}`;
	const result = rateLimiter.check(key, config);

	if (!result.allowed) {
		const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
		throw new RateLimitError(
			retryAfter,
			`Rate limit exceeded. Try again in ${retryAfter} seconds`,
		);
	}
}
