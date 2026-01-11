/**
 * Structured logging system
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
	[key: string]: unknown;
}

export interface LogEntry {
	level: LogLevel;
	message: string;
	context?: LogContext;
	timestamp: string;
	error?: {
		message: string;
		stack?: string;
		name?: string;
	};
}

class Logger {
	private isDevelopment = process.env.NODE_ENV === "development";

	private formatLog(entry: LogEntry): string {
		const { level, message, context, timestamp, error } = entry;

		const parts = [
			`[${timestamp}]`,
			`[${level.toUpperCase()}]`,
			message,
		];

		if (context && Object.keys(context).length > 0) {
			parts.push(JSON.stringify(context, null, 2));
		}

		if (error) {
			parts.push(`Error: ${error.message}`);
			if (error.stack) {
				parts.push(error.stack);
			}
		}

		return parts.join(" ");
	}

	private log(level: LogLevel, message: string, context?: LogContext): void {
		const entry: LogEntry = {
			level,
			message,
			context,
			timestamp: new Date().toISOString(),
		};

		const formatted = this.formatLog(entry);

		// Console output
		switch (level) {
			case "debug":
				if (this.isDevelopment) {
					console.debug(formatted);
				}
				break;
			case "info":
				console.info(formatted);
				break;
			case "warn":
				console.warn(formatted);
				break;
			case "error":
				console.error(formatted);
				break;
		}

		// TODO: Send to external logging service in production
		// if (!this.isDevelopment) {
		//   this.sendToLoggingService(entry);
		// }
	}

	debug(message: string, context?: LogContext): void {
		this.log("debug", message, context);
	}

	info(message: string, context?: LogContext): void {
		this.log("info", message, context);
	}

	warn(message: string, context?: LogContext): void {
		this.log("warn", message, context);
	}

	error(message: string, error?: Error, context?: LogContext): void {
		const entry: LogEntry = {
			level: "error",
			message,
			context,
			timestamp: new Date().toISOString(),
			error: error
				? {
						message: error.message,
						stack: error.stack,
						name: error.name,
					}
				: undefined,
		};

		const formatted = this.formatLog(entry);
		console.error(formatted);

		// TODO: Send to external logging service in production
	}

	/**
	 * Log performance metrics
	 */
	performance(operation: string, durationMs: number, context?: LogContext): void {
		this.info(`Performance: ${operation}`, {
			...context,
			durationMs,
			operation,
		});
	}

	/**
	 * Create a child logger with additional context
	 */
	child(context: LogContext): Logger {
		const childLogger = new Logger();
		const originalLog = childLogger.log.bind(childLogger);

		childLogger.log = (level: LogLevel, message: string, additionalContext?: LogContext) => {
			originalLog(level, message, { ...context, ...additionalContext });
		};

		return childLogger;
	}
}

// Export singleton instance
export const logger = new Logger();

/**
 * Performance measurement utility
 */
export function measurePerformance<T>(
	operation: string,
	fn: () => T | Promise<T>,
	context?: LogContext,
): Promise<T> {
	const start = performance.now();

	const finish = (result: T) => {
		const duration = performance.now() - start;
		logger.performance(operation, duration, context);
		return result;
	};

	try {
		const result = fn();
		if (result instanceof Promise) {
			return result.then(finish);
		}
		return Promise.resolve(finish(result));
	} catch (error) {
		const duration = performance.now() - start;
		logger.error(`${operation} failed`, error as Error, {
			...context,
			durationMs: duration,
		});
		throw error;
	}
}
