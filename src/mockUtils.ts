/**
 * Mock function utilities
 */

import { mock } from "bun:test";

/**
 * Create a mock function with proper typing
 *
 * @param implementation - Optional implementation for the mock
 * @returns Mock function
 */
export function createMock<T extends (...args: unknown[]) => unknown>(
  implementation?: T,
): ReturnType<typeof mock> {
  return implementation ? mock(implementation) : mock();
}
