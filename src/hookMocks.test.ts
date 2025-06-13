import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createMockHook } from "./hookMocks";

describe("hookMocks", () => {
  beforeEach(() => {
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("createMockHook", () => {
    it("should create a mock hook with return value", () => {
      expect.assertions(3);

      const returnValue = { user: { id: 1, name: "Test User" } };
      const mockHook = createMockHook("useUser", returnValue);

      expect(mockHook).toBeDefined();
      expect(typeof mockHook).toBe("function");
      expect(mockHook()).toEqual(returnValue);
    });

    it("should track hook calls", () => {
      expect.assertions(2);

      const mockHook = createMockHook("useData", { data: [] });

      mockHook();
      mockHook();

      expect(mockHook).toHaveBeenCalledTimes(2);
      expect(mockHook).toHaveReturned();
    });

    it("should handle different return value types", () => {
      expect.assertions(4);

      const stringHook = createMockHook("useString", "test");
      const numberHook = createMockHook("useNumber", 42);
      const booleanHook = createMockHook("useBoolean", true);
      const nullHook = createMockHook("useNull", null);

      expect(stringHook()).toBe("test");
      expect(numberHook()).toBe(42);
      expect(booleanHook()).toBe(true);
      expect(nullHook()).toBe(null);
    });
  });
});
