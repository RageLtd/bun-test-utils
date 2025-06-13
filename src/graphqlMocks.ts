/**
 * GraphQL mocking utilities
 */

import { mock } from "bun:test";

/**
 * Utility for mocking GraphQL queries/mutations
 *
 * @param operationName - Name of the GraphQL operation
 * @param mockData - Mock data to return
 * @param loading - Whether the operation is loading
 * @param error - Error to return (if any)
 * @returns Mock GraphQL hook
 */
export function createMockGraphQLHook(
	operationName: string,
	mockData: unknown = null,
	loading = false,
	error: Error | null = null,
) {
	const executeFn = mock(() => Promise.resolve({ data: mockData }));
	const hookResult = {
		loading,
		error,
		data: mockData,
		refetch: mock(() => Promise.resolve({ data: mockData })),
		fetchMore: mock(),
		networkStatus: 7,
		called: !loading,
	};

	// For lazy queries, return [executeFn, hookResult]
	// For regular queries, return hookResult
	return operationName.includes("Lazy") ? [executeFn, hookResult] : hookResult;
} 
