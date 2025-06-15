# Quick Start

Get up and running with `@rageltd/bun-test-utils` in just a few minutes. This guide will walk you through your first test using the library's core utilities.

## Your First Test

Let's create a simple test that demonstrates the key features of the library.

### 1. Create a Test File

Create a new test file in your project:

```typescript
// test/quick-start.test.ts
import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { 
  createModuleMocker, 
  createMockHook,
  setupTestCleanup,
  waitFor,
  createMock
} from '@rageltd/bun-test-utils';

// Setup automatic cleanup for all tests in this file
setupTestCleanup();

const mockModules = createModuleMocker();

describe('Quick Start Example', () => {
  beforeEach(async () => {
    // Mock a module with custom hooks
    await mockModules.mock('@/hooks/useUser', () => ({
      useUser: createMockHook('useUser', {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      })
    }));
  });

  afterAll(() => {
    // Clean up all module mocks
    mockModules.restoreAll();
  });

  it('should mock a simple function', () => {
    const mockFn = createMock((x: number) => x * 2);
    
    const result = mockFn(5);
    
    expect(mockFn).toHaveBeenCalledWith(5);
    expect(result).toBe(10);
  });

  it('should handle async operations', async () => {
    const mockAsyncFn = createMock(async (value: string) => {
      await waitFor(50); // Simulate async work
      return `Processed: ${value}`;
    });

    const result = await mockAsyncFn('test');

    expect(mockAsyncFn).toHaveBeenCalledWith('test');
    expect(result).toBe('Processed: test');
  });
});
```

### 2. Run Your Test

```bash
bun test test/quick-start.test.ts
```

You should see output indicating your tests passed!

## Common Patterns

### Testing React Components

```typescript
import { render } from '@testing-library/react';
import { createMockComponent, createMockHook } from '@rageltd/bun-test-utils';

describe('UserProfile Component', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks', () => ({
      useUser: createMockHook('useUser', {
        id: 1,
        name: 'John Doe',
        loading: false
      })
    }));

    await mockModules.mock('@/components', () => ({
      Avatar: createMockComponent('Avatar'),
      Button: createMockComponent('Button')
    }));
  });

  it('renders user information', () => {
    const { getByText } = render(<UserProfile />);
    expect(getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Testing GraphQL Operations

```typescript
import { createMockGraphQLHook } from '@rageltd/bun-test-utils';

describe('GraphQL Testing', () => {
  it('mocks a successful query', () => {
    const mockQuery = createMockGraphQLHook('useGetUser', {
      user: { id: 1, name: 'Alice' }
    });

    expect(mockQuery.data.user.name).toBe('Alice');
    expect(mockQuery.loading).toBe(false);
    expect(mockQuery.error).toBeNull();
  });

  it('mocks a loading state', () => {
    const mockQuery = createMockGraphQLHook('useGetUser', null, true);

    expect(mockQuery.loading).toBe(true);
    expect(mockQuery.data).toBeNull();
  });

  it('mocks an error state', () => {
    const error = new Error('Network error');
    const mockQuery = createMockGraphQLHook('useGetUser', null, false, error);

    expect(mockQuery.error).toBe(error);
    expect(mockQuery.loading).toBe(false);
  });
});
```

### Using Partial Mocks

```typescript
import { createPartialMock } from '@rageltd/bun-test-utils';

interface ApiResponse {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

describe('Partial Mocking', () => {
  it('creates partial mocks with type safety', () => {
    const mockResponse = createPartialMock<ApiResponse>({
      id: 1,
      name: 'Test User'
    });

    // TypeScript will ensure you only access defined properties
    expect(mockResponse.id).toBe(1);
    expect(mockResponse.name).toBe('Test User');
  });
});
```

## Best Practices

### 1. Use setupTestCleanup()

Always call this at the top of your test files:

```typescript
import { setupTestCleanup } from '@rageltd/bun-test-utils';

setupTestCleanup(); // Call once per test file
```

### 2. Organize Your Mocks

Keep your mocks organized and reusable:

```typescript
// test/mocks/user.ts
import { createMockHook } from '@rageltd/bun-test-utils';

export const createUserMock = (overrides = {}) => 
  createMockHook('useUser', {
    id: 1,
    name: 'Default User',
    email: 'user@example.com',
    ...overrides
  });
```

### 3. Use Module Mocker Pattern

Establish a consistent pattern for module mocking:

```typescript
const mockModules = createModuleMocker();

beforeEach(async () => {
  // Set up your mocks
});

afterAll(() => {
  mockModules.restoreAll();
});
```

## Common Issues

### Module Not Found Errors

If you get module not found errors, ensure your mock paths match your actual module paths:

```typescript
// ❌ Wrong - using relative path
await mockModules.mock('./hooks', () => ({}));

// ✅ Correct - using absolute path
await mockModules.mock('@/hooks', () => ({}));
```

### Mock Pollution

Always use proper cleanup to avoid test pollution:

```typescript
// ✅ Good - automatic cleanup
setupTestCleanup();

// ✅ Good - manual cleanup
afterAll(() => {
  mockModules.restoreAll();
});
```

## Next Steps

Now that you've got the basics down, explore more advanced features:

- [Testing Patterns](../guides/testing-patterns.md) - Advanced testing strategies
- [API Reference](../api-reference/) - Complete function documentation
- [Examples](../examples/) - Real-world usage examples
- [Working with Bun](../guides/working-with-bun.md) - Bun-specific tips and tricks