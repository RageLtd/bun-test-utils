import { describe, it, expect } from "bun:test";
import { waitFor } from "./asyncUtils";

describe("asyncUtils", () => {
  describe("waitFor", () => {
    it("should resolve immediately with default (0ms) delay", async () => {
      expect.assertions(1);

      const start = Date.now();
      await waitFor();
      const elapsed = Date.now() - start;

      // Should resolve almost immediately (within 10ms tolerance)
      expect(elapsed).toBeLessThan(10);
    });

    it("should wait for specified milliseconds", async () => {
      expect.assertions(1);

      const delay = 50;
      const start = Date.now();
      await waitFor(delay);
      const elapsed = Date.now() - start;

      // Should wait at least the specified delay (with some tolerance)
      expect(elapsed).toBeGreaterThanOrEqual(delay - 10);
    });

    it("should handle zero delay explicitly", async () => {
      expect.assertions(1);

      const start = Date.now();
      await waitFor(0);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(10);
    });

    it("should return a Promise", () => {
      expect.assertions(1);

      const result = waitFor(1);

      expect(result).toBeInstanceOf(Promise);
    });

    it("should be chainable", async () => {
      expect.assertions(1);

      const start = Date.now();
      await waitFor(25).then(() => waitFor(25));
      const elapsed = Date.now() - start;

      // Should wait for both delays
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });
  });
});
