/**
 * Utilities for cleaning up mocks and restoring state in Bun tests.
 */

import { afterAll, afterEach, mock } from "bun:test";
import { createModuleMocker } from "./moduleMocker";

/**
 * Sets up automatic cleanup for Bun tests.
 *
 * Registers an `afterEach` hook that restores all mocks after every test.
 * Call this once per test file to ensure a clean state between tests.
 */
export function setupTestCleanup(): void {
  afterEach(() => {
    mock.restore();
  });
}

/**
 * Runs a test suite with automatic mock cleanup.
 *
 * Wrap your test suite in this function to ensure all module mocks are restored after all tests.
 *
 * @param testSuiteFn - Function containing your describe/it blocks.
 */
export function withMockCleanup(testSuiteFn: () => void): void {
  const mockModules = createModuleMocker();

  afterAll(() => {
    mockModules.restoreAll();
  });

  testSuiteFn();
}
