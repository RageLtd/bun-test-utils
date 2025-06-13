import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { createSpy } from "./spyUtils";

describe("spyUtils", () => {
	beforeEach(() => {
		mock.restore();
	});

	afterEach(() => {
		mock.restore();
	});

	describe("createSpy", () => {
		it("should create a spy on an object method", () => {
			expect.assertions(3);

			const testObject = {
				testMethod: () => "original",
			};

			const spy = createSpy(testObject, "testMethod");

			expect(spy).toBeDefined();
			expect(typeof spy).toBe("function");
			
			// Call the method to verify spy is working
			testObject.testMethod();
			expect(spy).toHaveBeenCalledTimes(1);
		});

		it("should handle spying on methods that don't exist", () => {
			expect.assertions(1);

			const testObject: Record<string, unknown> = {};

			// This should still create a spy
			const spy = createSpy(testObject, "nonExistentMethod");
			expect(spy).toBeDefined();
		});
	});
}); 
