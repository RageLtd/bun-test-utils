/**
 * React hook mocking utilities
 */

import { mock } from "bun:test";

/**
 * Utility for mocking hooks with return values
 *
 * @param hookName - Name of the hook
 * @param returnValue - Default return value
 * @returns Mock hook function
 */
export function createMockHook<T>(hookName: string, returnValue: T) {
	const mockFn = mock(() => returnValue);
	// Note: mockName is not available in bun:test, but we can still return a functional mock
	return mockFn;
} 
