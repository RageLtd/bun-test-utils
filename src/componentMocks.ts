/**
 * React component mocking utilities
 */

/**
 * Utility for mocking React components
 *
 * @param componentName - Name of the component
 * @param props - Props to forward to the mock component
 * @returns Mock React component
 */
export function createMockComponent(componentName: string) {
	return function MockComponent(props: Record<string, unknown>) {
		return `<${componentName} data-testid="mock-${componentName.toLowerCase()}" ${
			props.children ? `>${props.children}</${componentName}>` : "/>"
		}`;
	};
} 
