import { describe, expect, it } from "bun:test";
import { createPartialMock } from "./partialMocks";

describe("partialMocks", () => {
  describe("createPartialMock", () => {
    it("should create a partial mock with overrides only", () => {
      expect.assertions(2);

      const overrides = { name: "Test", age: 25 };
      const result = createPartialMock<{
        name: string;
        age: number;
        email?: string;
      }>(undefined, overrides);

      expect(result.name).toBe("Test");
      expect(result.age).toBe(25);
    });

    it("should merge original and overrides", () => {
      expect.assertions(3);

      const original = {
        name: "Original",
        age: 30,
        email: "original@test.com",
      };
      const overrides = { age: 25 };
      const result = createPartialMock<typeof original>(original, overrides);

      expect(result.name).toBe("Original");
      expect(result.age).toBe(25); // overridden
      expect(result.email).toBe("original@test.com");
    });

    it("should handle empty original and overrides", () => {
      expect.assertions(1);

      const result = createPartialMock();

      expect(result).toEqual({});
    });

    it("should override original properties with override values", () => {
      expect.assertions(2);

      const original = { value: "original", keep: true };
      const overrides = { value: "overridden" };
      const result = createPartialMock<typeof original>(original, overrides);

      expect(result.value).toBe("overridden");
      expect(result.keep).toBe(true);
    });
  });
});
