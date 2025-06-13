import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { createModuleMocker, restoreModules, clearMockRegistry } from "./moduleMocker";

describe("moduleMocker", () => {
	beforeEach(() => {
		mock.restore();
		clearMockRegistry();
	});

	afterEach(() => {
		mock.restore();
		clearMockRegistry();
	});

	describe("createModuleMocker", () => {
		it("should create a module mocker with mock, restore, and restoreAll methods", () => {
			expect.assertions(3);

			const moduleMocker = createModuleMocker();

			expect(typeof moduleMocker.mock).toBe("function");
			expect(typeof moduleMocker.restore).toBe("function");
			expect(typeof moduleMocker.restoreAll).toBe("function");
		});

		it("should handle module mocking", async () => {
			expect.assertions(1);

			// Mock console.warn to suppress expected error for non-existent module
			const consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});

			const moduleMocker = createModuleMocker();
			const mockImplementation = () => ({ mockValue: "test" });

			// This should not throw
			await expect(
				moduleMocker.mock("non-existent-module", mockImplementation)
			).resolves.toBeUndefined();

			// Restore console.warn
			consoleWarnSpy.mockRestore();
		});

		it("should clean up all mocks when restoreAll is called", () => {
			expect.assertions(1);

			const moduleMocker = createModuleMocker();
			
			// This should not throw
			expect(() => moduleMocker.restoreAll()).not.toThrow();
		});
	});

	describe("restoreModules", () => {
		it("should restore modules from a modules map", () => {
			expect.assertions(1);

			const modulesMap = {
				"test-module": { original: true },
				"another-module": { value: 42 },
			};

			// This should not throw
			expect(() => restoreModules(modulesMap)).not.toThrow();
		});

		it("should handle empty modules map", () => {
			expect.assertions(1);

			expect(() => restoreModules({})).not.toThrow();
		});

		it("should handle null/undefined values in modules map", () => {
			expect.assertions(1);

			const modulesMap = {
				"valid-module": { test: true },
				"null-module": null,
				"undefined-module": undefined,
			};

			expect(() => restoreModules(modulesMap)).not.toThrow();
		});
	});

	describe("clearMockRegistry", () => {
		it("should clear the mock registry without throwing", () => {
			expect.assertions(1);

			expect(() => clearMockRegistry()).not.toThrow();
		});
	});
}); 
