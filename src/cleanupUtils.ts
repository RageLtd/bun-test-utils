/**
 * Test cleanup utilities
 */

import { afterAll, afterEach, mock } from "bun:test";
import { createModuleMocker } from "./moduleMocker";

/**
 * Setup automatic cleanup for tests
 * This should be called once per test file
 */
export function setupTestCleanup(): void {
	afterEach(() => {
		// Standard cleanup
		mock.restore();
	});
}

/**
 * Higher-order function to create a test suite with proper mock cleanup
 *
 * @param testSuiteFn - Function that contains the test suite
 */
export function withMockCleanup(testSuiteFn: () => void): void {
	const mockModules = createModuleMocker();

	afterAll(() => {
		mockModules.restoreAll();
	});

	testSuiteFn();
} 
