import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { createMock } from "./mockUtils";

describe("mockUtils", () => {
	beforeEach(() => {
		mock.restore();
	});

	afterEach(() => {
		mock.restore();
	});

	describe("createMock", () => {
		it("should create a mock function without implementation", () => {
			expect.assertions(2);

			const mockFn = createMock();

			expect(mockFn).toBeDefined();
			expect(typeof mockFn).toBe("function");
		});

		it("should create a mock function with implementation", () => {
			expect.assertions(3);

			const implementation = (...args: unknown[]) => (args[0] as number) * 2;
			const mockFn = createMock(implementation);

			expect(mockFn).toBeDefined();
			expect(typeof mockFn).toBe("function");
			expect(mockFn(5)).toBe(10);
		});

		it("should track function calls", () => {
			expect.assertions(2);

			const mockFn = createMock((...args: unknown[]) => (args[0] as number) + 1);
			
			mockFn(10);
			mockFn(20);

			expect(mockFn).toHaveBeenCalledTimes(2);
			expect(mockFn).toHaveBeenCalledWith(20);
		});
	});
}); 
