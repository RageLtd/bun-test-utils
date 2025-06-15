# Hook Mocking

The hook mocking module provides utilities for mocking React hooks in your tests, making it easy to control hook behavior and test components in isolation.

## createMockHook

### Signature

```typescript
function createMockHook<T>(hookName: string, returnValue: T): Mock
```

### Description

Creates a mock React hook with a specified return value. This utility is particularly useful for testing components that depend on custom hooks, allowing you to control the hook's behavior without executing its actual implementation.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `hookName` | `string` | Name of the hook (for debugging purposes) |
| `returnValue` | `T` | The value the mock hook should return |

### Returns

`Mock` - A Bun mock function that returns the specified value

### Examples

#### Basic Hook Mocking

```typescript
import { createMockHook } from '@rageltd/bun-test-utils';
import { test, expect } from 'bun:test';

test('mocks a simple hook', () => {
  const mockUseCounter = createMockHook('useCounter', {
    count: 5,
    increment: () => {},
    decrement: () => {}
  });

  const result = mockUseCounter();
  
  expect(result.count).toBe(5);
  expect(mockUseCounter).toHaveBeenCalledTimes(1);
});
```

#### Mocking User Authentication Hook

```typescript
import { createMockHook } from '@rageltd/bun-test-utils';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

test('mocks authentication hook', () => {
  const mockUseAuth = createMockHook<UseAuthReturn>('useAuth', {
    user: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    },
    isAuthenticated: true,
    login: async () => {},
    logout: () => {},
    loading: false
  });

  const authState = mockUseAuth();
  
  expect(authState.isAuthenticated).toBe(true);
  expect(authState.user?.role).toBe('admin');
});
```

#### Mocking Hooks with Functions

```typescript
import { createMock, createMockHook } from '@rageltd/bun-test-utils';

test('mocks hook with functional return values', () => {
  const mockSetState = createMock();
  const mockRefetch = createMock();

  const mockUseData = createMockHook('useData', {
    data: { users: [] },
    loading: false,
    error: null,
    refetch: mockRefetch,
    setState: mockSetState
  });

  const result = mockUseData();
  
  // Test that functions can be called
  result.refetch();
  result.setState({ users: [{ id: 1 }] });
  
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  expect(mockSetState).toHaveBeenCalledWith({ users: [{ id: 1 }] });
});
```

#### Different States for Different Tests

```typescript
import { createMockHook } from '@rageltd/bun-test-utils';

describe('UserProfile component', () => {
  test('renders when user is loaded', () => {
    const mockUseUser = createMockHook('useUser', {
      user: { id: 1, name: 'Alice' },
      loading: false,
      error: null
    });

    // Test component with loaded user
    // Your component test here
  });

  test('shows loading state', () => {
    const mockUseUser = createMockHook('useUser', {
      user: null,
      loading: true,
      error: null
    });

    // Test component with loading state
    // Your component test here
  });

  test('shows error state', () => {
    const mockUseUser = createMockHook('useUser', {
      user: null,
      loading: false,
      error: new Error('Failed to load user')
    });

    // Test component with error state
    // Your component test here
  });
});
```

## Advanced Usage

### Mocking Complex Hook State

```typescript
interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (onSubmit: (values: T) => void) => void;
  isValid: boolean;
  isSubmitting: boolean;
}

test('mocks complex form hook', () => {
  const mockHandleChange = createMock();
  const mockHandleSubmit = createMock();

  const mockUseForm = createMockHook<UseFormReturn<{ email: string; password: string }>>('useForm', {
    values: { email: 'test@example.com', password: 'password123' },
    errors: {},
    touched: { email: true, password: false },
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
    isValid: true,
    isSubmitting: false
  });

  const form = mockUseForm();
  
  expect(form.values.email).toBe('test@example.com');
  expect(form.isValid).toBe(true);
  expect(form.touched.email).toBe(true);
});
```

### Mocking Hooks with Dynamic Return Values

```typescript
test('mocks hook with changing return values', () => {
  let callCount = 0;
  
  const mockUseTimer = createMockHook('useTimer', null);
  
  // Override the mock to return different values on each call
  mockUseTimer.mockImplementation(() => {
    callCount++;
    return {
      seconds: callCount * 10,
      isRunning: callCount < 5,
      start: () => {},
      stop: () => {},
      reset: () => {}
    };
  });

  expect(mockUseTimer().seconds).toBe(10);
  expect(mockUseTimer().seconds).toBe(20);
  expect(mockUseTimer().isRunning).toBe(true);
});
```

### Mocking Hooks with Side Effects

```typescript
test('mocks hook with side effects', () => {
  const mockOnSuccess = createMock();
  const mockOnError = createMock();

  const mockUseApi = createMockHook('useApi', {
    data: null,
    loading: false,
    error: null,
    execute: createMock(async (params) => {
      if (params.shouldFail) {
        mockOnError(new Error('API Error'));
        return { error: new Error('API Error') };
      } else {
        mockOnSuccess({ id: 1, data: 'success' });
        return { data: { id: 1, data: 'success' } };
      }
    })
  });

  const api = mockUseApi();
  
  // Test successful call
  api.execute({ shouldFail: false });
  expect(mockOnSuccess).toHaveBeenCalledWith({ id: 1, data: 'success' });
  
  // Test failed call
  api.execute({ shouldFail: true });
  expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
});
```

## Integration with Module Mocking

### Complete Component Testing Setup

```typescript
import { 
  createModuleMocker, 
  createMockHook, 
  setupTestCleanup 
} from '@rageltd/bun-test-utils';

setupTestCleanup();

const mockModules = createModuleMocker();

describe('UserDashboard Component', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks/useAuth', () => ({
      useAuth: createMockHook('useAuth', {
        user: { id: 1, name: 'Test User' },
        isAuthenticated: true,
        logout: createMock()
      })
    }));

    await mockModules.mock('@/hooks/useNotifications', () => ({
      useNotifications: createMockHook('useNotifications', {
        notifications: [],
        unreadCount: 0,
        markAsRead: createMock()
      })
    }));
  });

  afterAll(() => {
    mockModules.restoreAll();
  });

  test('renders dashboard with user data', () => {
    // Your component test here
    // All hooks are properly mocked
  });
});
```

### Testing Hook Interactions

```typescript
test('tests interaction between multiple hooks', async () => {
  const mockRefetchUser = createMock();
  const mockShowNotification = createMock();

  await mockModules.mock('@/hooks', () => ({
    useUser: createMockHook('useUser', {
      user: { id: 1, name: 'John' },
      refetch: mockRefetchUser
    }),
    
    useNotifications: createMockHook('useNotifications', {
      show: mockShowNotification
    })
  }));

  // Test component that uses both hooks
  // Verify interactions between them
  
  expect(mockRefetchUser).toHaveBeenCalled();
  expect(mockShowNotification).toHaveBeenCalledWith('User updated');
});
```

## Best Practices

### 1. Use Descriptive Hook Names

```typescript
// ✅ Good - descriptive names
const mockUseUserProfile = createMockHook('useUserProfile', userData);
const mockUseShoppingCart = createMockHook('useShoppingCart', cartData);

// ❌ Avoid - generic names
const mockHook1 = createMockHook('hook1', data);
const mockHook2 = createMockHook('hook2', data);
```

### 2. Match Real Hook Interface

```typescript
// ✅ Good - matches real hook interface
const mockUseUser = createMockHook('useUser', {
  user: { id: 1, name: 'John' },
  loading: false,
  error: null,
  refetch: createMock()
});

// ❌ Avoid - incomplete interface
const mockUseUser = createMockHook('useUser', {
  user: { id: 1 }
  // missing loading, error, refetch
});
```

### 3. Create Reusable Mock Factories

```typescript
// Create factory functions for common mock patterns
function createMockUserHook(overrides = {}) {
  return createMockHook('useUser', {
    user: { id: 1, name: 'Default User' },
    loading: false,
    error: null,
    refetch: createMock(),
    ...overrides
  });
}

// Use in tests
test('with loading user', () => {
  const mockUseUser = createMockUserHook({ loading: true, user: null });
  // Test loading state
});

test('with error state', () => {
  const mockUseUser = createMockUserHook({ 
    error: new Error('Failed'), 
    user: null 
  });
  // Test error state
});
```

### 4. Test Hook Function Calls

```typescript
test('verifies hook functions are called correctly', () => {
  const mockUpdate = createMock();
  const mockDelete = createMock();

  const mockUseUsers = createMockHook('useUsers', {
    users: [],
    updateUser: mockUpdate,
    deleteUser: mockDelete
  });

  const { updateUser, deleteUser } = mockUseUsers();

  updateUser(1, { name: 'Updated Name' });
  deleteUser(2);

  expect(mockUpdate).toHaveBeenCalledWith(1, { name: 'Updated Name' });
  expect(mockDelete).toHaveBeenCalledWith(2);
});
```

## Common Patterns

### Authentication Hook Pattern

```typescript
function createAuthMock(authState = 'authenticated') {
  const baseState = {
    login: createMock(),
    logout: createMock(),
    register: createMock()
  };

  switch (authState) {
    case 'authenticated':
      return createMockHook('useAuth', {
        ...baseState,
        user: { id: 1, email: 'test@example.com' },
        isAuthenticated: true,
        loading: false
      });
      
    case 'loading':
      return createMockHook('useAuth', {
        ...baseState,
        user: null,
        isAuthenticated: false,
        loading: true
      });
      
    case 'unauthenticated':
      return createMockHook('useAuth', {
        ...baseState,
        user: null,
        isAuthenticated: false,
        loading: false
      });
  }
}
```

### Data Fetching Hook Pattern

```typescript
function createDataMock<T>(data: T, state = 'success') {
  const baseState = {
    refetch: createMock(),
    mutate: createMock()
  };

  switch (state) {
    case 'success':
      return createMockHook('useData', {
        ...baseState,
        data,
        loading: false,
        error: null
      });
      
    case 'loading':
      return createMockHook('useData', {
        ...baseState,
        data: null,
        loading: true,
        error: null
      });
      
    case 'error':
      return createMockHook('useData', {
        ...baseState,
        data: null,
        loading: false,
        error: new Error('Failed to fetch data')
      });
  }
}
```

## Troubleshooting

### Hook Not Being Called

```typescript
// ❌ Problem: Hook mock not applied to module
const mockHook = createMockHook('useUser', userData);
// Component still uses real hook

// ✅ Solution: Mock the module
await mockModules.mock('@/hooks', () => ({
  useUser: mockHook
}));
```

### Type Errors with Hook Mocks

```typescript
// ❌ Problem: Type mismatch
interface UseDataReturn {
  data: ComplexType[];
  loading: boolean;
}

const mock = createMockHook('useData', {
  data: 'wrong type', // Type error!
  loading: false
});

// ✅ Solution: Proper typing
const mock = createMockHook<UseDataReturn>('useData', {
  data: [],
  loading: false
});
```

## See Also

- [Module Mocking](module-mocking.md) - For mocking entire modules containing hooks
- [Component Mocking](component-mocking.md) - For mocking React components
- [Mock Utilities](mock-utilities.md) - For general mock function creation
- [React Testing Examples](../examples/react-components.md) - Real-world hook mocking examples