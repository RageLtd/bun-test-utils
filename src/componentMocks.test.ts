import { describe, it, expect } from "bun:test";
import { createMockComponent } from "./componentMocks";

describe("componentMocks", () => {
  describe("createMockComponent", () => {
    it("should create a mock component with correct name", () => {
      expect.assertions(2);

      const MockButton = createMockComponent("Button");
      const result = MockButton({ children: "Click me" });

      expect(result).toContain("Button");
      expect(result).toContain("mock-button");
    });

    it("should handle component without children", () => {
      expect.assertions(2);

      const MockInput = createMockComponent("Input");
      const result = MockInput({ placeholder: "Enter text" });

      expect(result).toContain("Input");
      expect(result).toContain("/>");
    });

    it("should handle component with children", () => {
      expect.assertions(3);

      const MockDiv = createMockComponent("Div");
      const result = MockDiv({ children: "Content" });

      expect(result).toContain("Div");
      expect(result).toContain("Content");
      expect(result).toContain("</Div>");
    });
  });
});
