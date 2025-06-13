/**
 * Spy utilities for test mocking
 */

import { spyOn } from "bun:test";

/**
 * Create a spy on an object method with automatic cleanup
 *
 * @param object - The object containing the method
 * @param methodName - The name of the method to spy on
 * @returns The spy function
 */
export function createSpy<T extends Record<string, unknown>, K extends keyof T>(
  object: T,
  methodName: K,
): ReturnType<typeof spyOn> {
  return spyOn(object, methodName);
}
