/**
 * Module mocking utilities for handling bun:test mocking issues
 *
 * This module provides utilities to work around the known bug in bun:test
 * where mock.restore() doesn't properly restore modules that were mocked
 * with mock.module().
 *
 * See: https://github.com/oven-sh/bun/issues/7823
 */

import { mock } from "bun:test";

type MockedModule = Record<string, unknown>;
type OriginalModule = Record<string, unknown>;

/**
 * Registry to track original modules before mocking
 */
class MockRegistry {
  private originalModules = new Map<string, OriginalModule>();
  private modulePromises = new Map<string, Promise<OriginalModule>>();

  /**
   * Store the original module before mocking
   */
  async storeOriginal(modulePath: string): Promise<OriginalModule> {
    const cachedModule = this.originalModules.get(modulePath);
    if (cachedModule) {
      return cachedModule;
    }

    // Check if we're already loading this module
    const modulePromise = this.modulePromises.get(modulePath);
    if (modulePromise) {
      return modulePromise;
    }

    // Import the original module and cache it
    const importPromise = import(modulePath);
    this.modulePromises.set(modulePath, importPromise);

    try {
      const original = await importPromise;
      this.originalModules.set(modulePath, original);
      this.modulePromises.delete(modulePath);
      return original;
    } catch (error) {
      this.modulePromises.delete(modulePath);
      throw error;
    }
  }

  /**
   * Get the original module
   */
  getOriginal(modulePath: string): OriginalModule | undefined {
    return this.originalModules.get(modulePath);
  }

  /**
   * Restore a specific module to its original state
   */
  restoreModule(modulePath: string): void {
    const original = this.originalModules.get(modulePath);
    if (original) {
      mock.module(modulePath, () => original);
    }
  }

  /**
   * Restore all modules to their original state
   */
  restoreAll(): void {
    for (const [modulePath, original] of this.originalModules) {
      mock.module(modulePath, () => original);
    }
  }

  /**
   * Clear the registry
   */
  clear(): void {
    this.originalModules.clear();
    this.modulePromises.clear();
  }
}

// Global registry instance
const mockRegistry = new MockRegistry();

/**
 * Helper to create a module mocker with proper restoration
 *
 * Usage:
 * ```typescript
 * const mockModules = createModuleMocker();
 *
 * beforeEach(async () => {
 *   await mockModules.mock("@pilot/hooks", () => ({
 *     useWiki: createMockHook("useWiki", { currentWiki: null }),
 *   }));
 * });
 *
 * afterAll(() => {
 *   mockModules.restoreAll();
 * });
 * ```
 */
export function createModuleMocker() {
  const originalModules = new Map<string, unknown>();

  return {
    async mock(modulePath: string, mockImplementation: () => MockedModule) {
      // Store original if not already stored
      if (!originalModules.has(modulePath)) {
        try {
          const original = await import(modulePath);
          originalModules.set(modulePath, original);
        } catch (error) {
          // Module might not exist or be mocked already
          console.warn(`Could not store original for ${modulePath}:`, error);
        }
      }

      // Apply the mock
      mock.module(modulePath, mockImplementation);
    },

    restore(modulePath: string) {
      const original = originalModules.get(modulePath);
      if (original) {
        mock.restore();
        mock.module(modulePath, () => original);
      }
    },

    restoreAll() {
      mock.restore();
      for (const [modulePath, original] of originalModules) {
        mock.module(modulePath, () => original);
      }
      originalModules.clear();
    },
  };
}

/**
 * Pattern for storing and restoring module mocks
 *
 * Usage in test file:
 * ```typescript
 * // Store originals at the top of the test file
 * const originals = {
 *   hooks: await import("@pilot/hooks"),
 *   graphql: await import("@pilot/graphql"),
 * };
 *
 * beforeEach(() => {
 *   mock.module("@pilot/hooks", () => ({
 *     useWiki: createMockHook("useWiki", { currentWiki: null }),
 *   }));
 * });
 *
 * afterAll(() => {
 *   restoreModules({
 *     "@pilot/hooks": originals.hooks,
 *     "@pilot/graphql": originals.graphql,
 *   });
 * });
 * ```
 */
export function restoreModules(modulesMap: Record<string, unknown>): void {
  mock.restore();
  for (const [modulePath, original] of Object.entries(modulesMap)) {
    if (original) {
      mock.module(modulePath, () => original);
    }
  }
}

/**
 * Clear the mock registry (useful for test cleanup)
 */
export function clearMockRegistry(): void {
  mockRegistry.clear();
}
