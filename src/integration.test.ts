import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  clearMockRegistry,
  createMock,
  createMockComponent,
  createMockHook,
  createModuleMocker,
  createPartialMock,
  createSpy,
  waitFor,
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

  it("should handle multiple utilities working together", async () => {
    expect.assertions(6);

    // Test module mocker
    const moduleMocker = createModuleMocker();
    expect(typeof moduleMocker.mock).toBe("function");

    // Test spy
    const testObject = { method: () => "original" };
    const spy = createSpy(testObject, "method");
    testObject.method();
    expect(spy).toHaveBeenCalledTimes(1);

    // Test mock function
    const mockFn = createMock(() => "mocked");
    expect(mockFn()).toBe("mocked");

    // Test mock component
    const MockButton = createMockComponent("Button");
    const buttonResult = MockButton({ children: "Click me" });
    expect(buttonResult).toContain("Button");

    // Test mock hook
    const mockHook = createMockHook("useTest", { data: "test" });
    expect(mockHook()).toEqual({ data: "test" });

    // Test partial mock
    const partialMock = createPartialMock<{
      original: boolean;
      override?: boolean;
    }>({ original: true }, { override: true });
    expect(partialMock).toEqual({ original: true, override: true });

    // Test async utility
    await waitFor(1);
  });

  it("should handle cleanup scenarios", () => {
    expect.assertions(3);

    // Create multiple utilities
    const moduleMocker = createModuleMocker();
    const spy = createSpy({ test: () => {} }, "test");
    const mockFn = createMock();

    // Verify they all exist
    expect(typeof moduleMocker.restoreAll).toBe("function");
    expect(typeof spy).toBe("function");
    expect(typeof mockFn).toBe("function");

    // Cleanup should not throw
    moduleMocker.restoreAll();
    clearMockRegistry();
    mock.restore();
  });
});
