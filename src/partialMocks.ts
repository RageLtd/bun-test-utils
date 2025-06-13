/**
 * Partial mock utilities
 */

/**
 * Type-safe way to create partial mocks of objects
 *
 * @param original - Original object (optional)
 * @param overrides - Properties to override
 * @returns Partial mock object
 */
export function createPartialMock<T>(
	original?: Partial<T>,
	overrides?: Partial<T>,
): T {
	return {
		...original,
		...overrides,
	} as T;
} 
