import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  clearMockRegistry,
  createModuleMocker,
  setupTestCleanup,
  withMockCleanup,
} from "./index";

describe("Integration Tests", () => {
  beforeEach(() => {
    mock.restore();
    clearMockRegistry();
  });

  afterEach(() => {
    mock.restore();
    clearMockRegistry();
  });

  it("should handle module mocker and cleanup utilities working together", async () => {
    expect.assertions(4);

    // Test module mocker
    const moduleMocker = createModuleMocker();
    expect(typeof moduleMocker.mock).toBe("function");
    expect(typeof moduleMocker.restore).toBe("function");
    expect(typeof moduleMocker.restoreAll).toBe("function");

    // Test that setupTestCleanup doesn't throw
    expect(() => setupTestCleanup()).not.toThrow();
  });

  it("should handle cleanup scenarios with module mocker", () => {
    expect.assertions(1);

    // Create module mocker
    const moduleMocker = createModuleMocker();

    // Cleanup should not throw
    expect(() => {
      moduleMocker.restoreAll();
      clearMockRegistry();
      mock.restore();
    }).not.toThrow();
  });

  it("should handle withMockCleanup wrapper function", () => {
    expect.assertions(1);

    // Test that withMockCleanup executes the test suite function
    let executed = false;
    const testSuiteFn = () => {
      executed = true;
    };

    withMockCleanup(testSuiteFn);

    expect(executed).toBe(true);
  });

  it("should handle full workflow with all utilities", async () => {
    expect.assertions(2);

    let testExecuted = false;

    // Use withMockCleanup to wrap a test suite
    withMockCleanup(() => {
      // Setup cleanup
      setupTestCleanup();

      // Create module mocker
      const moduleMocker = createModuleMocker();

      // Verify everything is working
      expect(typeof moduleMocker.restoreAll).toBe("function");
      testExecuted = true;
    });

    expect(testExecuted).toBe(true);
  });
});
