import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { setupTestCleanup, withMockCleanup } from "./cleanupUtils";

describe("cleanupUtils", () => {
  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("setupTestCleanup", () => {
    it("should setup cleanup without throwing", () => {
      expect.assertions(1);

      expect(() => setupTestCleanup()).not.toThrow();
    });
  });

  describe("withMockCleanup", () => {
    it("should execute test suite function", () => {
      expect.assertions(1);

      const testSuiteFn = mock(() => {});

      withMockCleanup(testSuiteFn);

      expect(testSuiteFn).toHaveBeenCalledTimes(1);
    });

    it("should handle test suite function that throws", () => {
      expect.assertions(1);

      const testSuiteFn = () => {
        throw new Error("Test error");
      };

      expect(() => withMockCleanup(testSuiteFn)).toThrow("Test error");
    });
  });
});
