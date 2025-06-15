# Mock Utilities

The mock utilities module provides core mocking functionality with proper TypeScript support, making it easy to create and manage mock functions in your tests.

## createMock

### Signature

```typescript
function createMock<T extends (...args: unknown[]) => unknown>(
  implementation?: T
): ReturnType<typeof mock>
```

### Description

Creates a mock function with proper typing support. This is a wrapper around Bun's native `mock()` function that provides better TypeScript integration and consistent behavior.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `implementation` | `T` | `undefined` | Optional implementation function for the mock |

### Returns

`ReturnType<typeof mock>` - A Bun mock function with the specified implementation

### Examples

#### Basic Mock Function

```typescript
import { createMock } from '@rageltd/bun-test-utils';
import { test, expect } from 'bun:test';

test('creates a basic mock function', () => {
  const mockFn = createMock();
  
  mockFn('test', 123);
  
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn).toHaveBeenCalledWith('test', 123);
});
```

#### Mock with Implementation

```typescript
import { createMock } from '@rageltd/bun-test-utils';

test('creates mock with custom implementation', () => {
  const mockFn = createMock((x: number, y: number) => x + y);
  
  const result = mockFn(5, 3);
  
  expect(result).toBe(8);
  expect(mockFn).toHaveBeenCalledWith(5, 3);
});
```

#### Type-Safe Mock

```typescript
interface UserService {
  getUser(id: number): Promise<User>;
  createUser(data: CreateUserData): Promise<User>;
}

test('creates type-safe service mock', () => {
  const mockGetUser = createMock<UserService['getUser']>(
    async (id: number) => ({
      id,
      name: 'Test User',
      email: 'test@example.com'
    })
  );
  
  const result = await mockGetUser(1);
  
  expect(result.name).toBe('Test User');
  expect(mockGetUser).toHaveBeenCalledWith(1);
});
```

#### Mocking Different Return Values

```typescript
test('mock with different return values', () => {
  const mockFn = createMock();
  
  // Set up different return values
  mockFn.mockReturnValueOnce('first');
  mockFn.mockReturnValueOnce('second');
  mockFn.mockReturnValue('default');
  
  expect(mockFn()).toBe('first');
  expect(mockFn()).toBe('second');
  expect(mockFn()).toBe('default');
  expect(mockFn()).toBe('default');
});
```

#### Async Mock Functions

```typescript
test('creates async mock function', async () => {
  const mockAsyncFn = createMock(async (data: string) => {
    return `Processed: ${data}`;
  });
  
  const result = await mockAsyncFn('test data');
  
  expect(result).toBe('Processed: test data');
  expect(mockAsyncFn).toHaveBeenCalledWith('test data');
});
```

#### Mock with Conditional Logic

```typescript
test('mock with conditional implementation', () => {
  const mockValidator = createMock((input: string) => {
    if (input.length < 3) {
      throw new Error('Input too short');
    }
    return true;
  });
  
  expect(mockValidator('valid')).toBe(true);
  expect(() => mockValidator('no')).toThrow('Input too short');
});
```

## Advanced Usage

### Mocking Class Methods

```typescript
class ApiClient {
  async fetchData(endpoint: string) {
    // Real implementation
  }
}

test('mocks class method', () => {
  const client = new ApiClient();
  
  // Replace method with mock
  client.fetchData = createMock(async (endpoint: string) => ({
    data: `Mock data for ${endpoint}`,
    status: 200
  }));
  
  const result = await client.fetchData('/users');
  
  expect(result.data).toBe('Mock data for /users');
});
```

### Mocking with Side Effects

```typescript
test('mock with side effects', () => {
  let callCount = 0;
  
  const mockFn = createMock((value: number) => {
    callCount++;
    return value * callCount;
  });
  
  expect(mockFn(5)).toBe(5);  // 5 * 1
  expect(mockFn(5)).toBe(10); // 5 * 2
  expect(mockFn(5)).toBe(15); // 5 * 3
});
```

### Partial Implementation Mocking

```typescript
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
}

test('mocks only specific methods', () => {
  const calculator: Partial<Calculator> = {
    add: createMock((a: number, b: number) => a + b),
    multiply: createMock((a: number, b: number) => a * b)
    // subtract is not mocked
  };
  
  expect(calculator.add!(2, 3)).toBe(5);
  expect(calculator.multiply!(4, 5)).toBe(20);
});
```

## Best Practices

### 1. Use Type Annotations

Always provide proper TypeScript types for better IDE support:

```typescript
// ✅ Good - with type annotation
const mockFn = createMock<(id: number) => Promise<User>>();

// ❌ Avoid - without types
const mockFn = createMock();
```

### 2. Keep Mock Logic Simple

Avoid complex logic in mock implementations:

```typescript
// ❌ Avoid complex mock logic
const mockFn = createMock((input) => {
  if (condition1) {
    // complex logic
  } else if (condition2) {
    // more complex logic
  }
  // ... many more conditions
});

// ✅ Simple mock with clear behavior
const mockFn = createMock((input) => `processed-${input}`);
```

### 3. Use Descriptive Mock Data

Make your mock data meaningful for the test:

```typescript
// ❌ Generic mock data
const mockUser = createMock(() => ({ id: 1, name: 'test' }));

// ✅ Descriptive mock data
const mockUser = createMock(() => ({
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'admin'
}));
```

### 4. Reset Mocks Between Tests

Ensure clean state between tests:

```typescript
import { beforeEach } from 'bun:test';

const mockFn = createMock();

beforeEach(() => {
  mockFn.mockReset();
});
```

## Common Patterns

### Factory Pattern for Mocks

```typescript
// Create reusable mock factories
function createUserServiceMock() {
  return {
    getUser: createMock(async (id: number) => ({
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`
    })),
    
    createUser: createMock(async (data: any) => ({
      id: Math.random(),
      ...data,
      createdAt: new Date()
    }))
  };
}

test('uses mock factory', async () => {
  const userService = createUserServiceMock();
  
  const user = await userService.getUser(1);
  expect(user.name).toBe('User 1');
});
```

### Conditional Mock Responses

```typescript
test('mock with conditional responses', () => {
  const mockApi = createMock((endpoint: string) => {
    switch (endpoint) {
      case '/users':
        return { users: [] };
      case '/posts':
        return { posts: [] };
      default:
        throw new Error('Unknown endpoint');
    }
  });
  
  expect(mockApi('/users')).toEqual({ users: [] });
  expect(mockApi('/posts')).toEqual({ posts: [] });
  expect(() => mockApi('/unknown')).toThrow('Unknown endpoint');
});
```

### Mock with State Tracking

```typescript
test('mock that tracks state', () => {
  let state = { count: 0 };
  
  const mockCounter = createMock(() => {
    state.count++;
    return state.count;
  });
  
  expect(mockCounter()).toBe(1);
  expect(mockCounter()).toBe(2);
  expect(mockCounter()).toBe(3);
});
```

## Troubleshooting

### Mock Not Being Called

```typescript
// ❌ Problem: Mock not registered properly
const obj = { method: () => 'original' };
const mockMethod = createMock();
// obj.method is still original

// ✅ Solution: Properly assign mock
obj.method = mockMethod;
```

### Type Errors with Mocks

```typescript
// ❌ Problem: Type mismatch
interface Service {
  process(data: ComplexType): Promise<Result>;
}

const mock: Service = {
  process: createMock() // Type error!
};

// ✅ Solution: Proper typing
const mock: Service = {
  process: createMock<Service['process']>()
};
```

## See Also

- [Spy Utilities](spy-utilities.md) - For spying on existing functions
- [Hook Mocking](hook-mocking.md) - For React hook mocking
- [Module Mocking](module-mocking.md) - For mocking entire modules
- [Testing Patterns](../guides/testing-patterns.md) - Learn advanced mocking patterns