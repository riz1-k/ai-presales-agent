import { z } from "zod";

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
	// Basic HTML sanitization - remove script tags and event handlers
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/on\w+="[^"]*"/gi, "")
		.replace(/on\w+='[^']*'/gi, "")
		.replace(/javascript:/gi, "");
}

/**
 * Sanitize markdown to prevent XSS
 */
export function sanitizeMarkdown(markdown: string): string {
	// Remove potentially dangerous markdown patterns
	return markdown
		.replace(/\[.*?\]\(javascript:.*?\)/gi, "")
		.replace(/<script.*?<\/script>/gi, "");
}

/**
 * Validate and sanitize project name
 */
export const projectNameSchema = z
	.string()
	.min(1, "Project name is required")
	.max(100, "Project name must be less than 100 characters")
	.regex(/^[a-zA-Z0-9\s\-_.,()]+$/, "Project name contains invalid characters");

/**
 * Validate email
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Validate URL
 */
export const urlSchema = z.string().url("Invalid URL");

/**
 * Validate file size
 */
export function validateFileSize(
	file: File,
	maxSizeMB: number,
): { valid: boolean; error?: string } {
	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		return {
			valid: false,
			error: `File size must be less than ${maxSizeMB}MB`,
		};
	}
	return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(
	file: File,
	allowedTypes: string[],
): { valid: boolean; error?: string } {
	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: `File type must be one of: ${allowedTypes.join(", ")}`,
		};
	}
	return { valid: true };
}

/**
 * Escape special characters for SQL LIKE queries
 */
export function escapeLikeQuery(query: string): string {
	return query.replace(/[%_\\]/g, "\\$&");
}

/**
 * Validate and parse JSON safely
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
	try {
		return JSON.parse(json) as T;
	} catch {
		return fallback;
	}
}

/**
 * Truncate string to max length
 */
export function truncate(
	str: string,
	maxLength: number,
	suffix = "...",
): string {
	if (str.length <= maxLength) return str;
	return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Validate timezone
 */
export function isValidTimezone(timezone: string): boolean {
	try {
		Intl.DateTimeFormat(undefined, { timeZone: timezone });
		return true;
	} catch {
		return false;
	}
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(str: string): string {
	return str.replace(/\s+/g, " ").trim();
}

/**
 * Remove control characters
 */
export function removeControlCharacters(str: string): string {
	// Remove all control characters except newline and tab
	// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional
	return str.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "");
}

/**
 * Validate numeric range
 */
export function validateRange(
	value: number,
	min: number,
	max: number,
): { valid: boolean; error?: string } {
	if (value < min || value > max) {
		return {
			valid: false,
			error: `Value must be between ${min} and ${max}`,
		};
	}
	return { valid: true };
}
