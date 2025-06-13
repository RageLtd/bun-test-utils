/**
 * Async utilities for testing
 */

/**
 * Utility to wait for async operations in tests
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function waitFor(ms = 0): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
} 
