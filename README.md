# @rageltd/bun-test-utils

![Tests](https://github.com/rageltd/bun-test-utils/workflows/Pull%20Request%20Tests/badge.svg)
![Release](https://github.com/rageltd/bun-test-utils/workflows/Release/badge.svg)
![npm](https://img.shields.io/npm/v/@rageltd/bun-test-utils)

A collection of test utilities for Bun projects, designed to work around common issues with `bun:test` mocking and provide helpful testing patterns.

## Installation

```bash
bun install @rageltd/bun-test-utils
```

## API Reference

### Async Utilities

#### `waitFor(ms?: number): Promise<void>`
Utility to wait for async operations in tests.

```typescript
import { waitFor } from '@rageltd/bun-test-utils';

// Wait for async operations to complete
await waitFor(100);

// Wait for next tick (default 0ms)
await waitFor();
```

### Mock Utilities

#### `createMock<T>(implementation?: T): Mock`
Create a mock function with proper typing.

```typescript
import { createMock } from '@rageltd/bun-test-utils';

// Simple mock
const mockFn = createMock();

// Mock with implementation
const mockWithImpl = createMock((x: number) => x * 2);
```

### Hook Mocking

#### `createMockHook<T>(hookName: string, returnValue: T): Mock`
Create mock React hooks with return values.

```typescript
import { createMockHook } from '@rageltd/bun-test-utils';

const mockUserHook = createMockHook('useUser', { 
  id: 1, 
  name: 'Test User' 
});
```

### Component Mocking

#### `createMockComponent(componentName: string): Component`
Create mock React components for testing.

```typescript
import { createMockComponent } from '@rageltd/bun-test-utils';

const MockButton = createMockComponent('Button');
// Renders: <Button data-testid="mock-button" />
```

### GraphQL Mocking

#### `createMockGraphQLHook(operationName: string, mockData?: unknown, loading?: boolean, error?: Error | null): GraphQLHook`
Mock GraphQL operations with loading states and error handling.

```typescript
import { createMockGraphQLHook } from '@rageltd/bun-test-utils';

// Regular query
const mockQuery = createMockGraphQLHook('useGetUser', 
  { user: { id: 1, name: 'John' } }
);

// Lazy query (returns [execute, result])
const [executeQuery, queryResult] = createMockGraphQLHook('useLazyGetUser',
  { user: { id: 1, name: 'John' } }
);

// With loading state
const loadingQuery = createMockGraphQLHook('useGetUser', null, true);

// With error
const errorQuery = createMockGraphQLHook('useGetUser', 
  null, false, new Error('Failed to fetch')
);
```

### Module Mocking

#### `createModuleMocker(): ModuleMocker`
Create a module mocker with proper cleanup for handling bun:test mocking issues.

```typescript
import { createModuleMocker, createMockHook } from '@rageltd/bun-test-utils';

const mockModules = createModuleMocker();

// Mock a module
await mockModules.mock('@/hooks', () => ({
  useUser: createMockHook('useUser', { id: 1, name: 'Test' })
}));

// Restore specific module
mockModules.restore('@/hooks');

// Restore all modules
mockModules.restoreAll();
```

#### `restoreModules(modulesMap: Record<string, unknown>): void`
Pattern for manually restoring modules to their original state.

```typescript
import { restoreModules } from '@rageltd/bun-test-utils';

// Store originals
const originals = {
  hooks: await import('@/hooks'),
  utils: await import('@/utils'),
};

// Restore after tests
restoreModules({
  '@/hooks': originals.hooks,
  '@/utils': originals.utils,
});
```

### Partial Mocks

#### `createPartialMock<T>(original?: Partial<T>, overrides?: Partial<T>): T`
Create type-safe partial mocks of objects.

```typescript
import { createPartialMock } from '@rageltd/bun-test-utils';

interface User {
  id: number;
  name: string;
  email: string;
}

const mockUser = createPartialMock<User>({ id: 1 }, { name: 'Test User' });
// Result: { id: 1, name: 'Test User' }
```

### Spy Utilities

#### `createSpy<T, K>(object: T, methodName: K): Spy`
Create a spy on an object method with automatic cleanup.

```typescript
import { createSpy } from '@rageltd/bun-test-utils';

const userService = {
  getUser: (id: number) => ({ id, name: 'User' })
};

const getUserSpy = createSpy(userService, 'getUser');
```

### Cleanup Utilities

#### `setupTestCleanup(): void`
Setup automatic cleanup for tests (call once per test file).

```typescript
import { setupTestCleanup } from '@rageltd/bun-test-utils';

setupTestCleanup(); // Call at top of test file
```

#### `withMockCleanup(testSuiteFn: () => void): void`
Higher-order function to create test suites with proper mock cleanup.

```typescript
import { withMockCleanup, createModuleMocker } from '@rageltd/bun-test-utils';

withMockCleanup(() => {
  describe('My Test Suite', () => {
    // Your tests here - cleanup is handled automatically
  });
});
```

## Usage Examples

### Basic Testing Pattern

```typescript
import { 
  createMockHook, 
  createModuleMocker, 
  setupTestCleanup,
  waitFor 
} from '@rageltd/bun-test-utils';

// Setup cleanup once per file
setupTestCleanup();

const mockModules = createModuleMocker();

describe('Component Tests', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks', () => ({
      useUser: createMockHook('useUser', { id: 1, name: 'Test User' })
    }));
  });

  afterAll(() => {
    mockModules.restoreAll();
  });

  it('should render user data', async () => {
    // Your test here
    await waitFor(100); // Wait for async operations
  });
});
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Test
bun test

# Lint
bun run lint
```

## Contributing

This project uses semantic-release for automated versioning and publishing based on conventional commits.

### Conventional Commits

Use the interactive commit tool:
```bash
bun run commit
```

Or format commits manually:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Commit Types for Releases**:
- `fix:` - Bug fixes (patch release: 1.0.1)
- `feat:` - New features (minor release: 1.1.0)
- `BREAKING CHANGE` or `!` - Breaking changes (major release: 2.0.0)
- Other types (`docs:`, `style:`, `refactor:`, `test:`, `chore:`) don't trigger releases

### Workflow

1. Fork and create a feature branch
2. Install dependencies: `bun install`
3. Make changes and add tests
4. Commit using conventional format: `bun run commit`
5. Push and open a Pull Request

CI will automatically handle testing, building, and releasing when merged to main.

## Features

- 🚀 Built with Bun for performance
- 📦 Dual package (ESM + CommonJS) support
- 🔧 Full TypeScript support
- 🧪 Comprehensive test utilities
- ⚡ Automated CI/CD with semantic versioning