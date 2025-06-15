# Testing Patterns

This guide covers advanced testing patterns and best practices when using `@rageltd/bun-test-utils` for comprehensive test coverage and maintainable test suites.

## Core Testing Patterns

### 1. Test Setup and Cleanup Pattern

The foundation of reliable tests is proper setup and cleanup. This pattern ensures test isolation and prevents test pollution.

```typescript
import { 
  createModuleMocker, 
  setupTestCleanup,
  createMockHook 
} from '@rageltd/bun-test-utils';
import { describe, it, beforeEach, afterAll } from 'bun:test';

// Global cleanup setup - call once per test file
setupTestCleanup();

const mockModules = createModuleMocker();

describe('UserProfile Component', () => {
  beforeEach(async () => {
    // Fresh mocks for each test
    await mockModules.mock('@/hooks/useAuth', () => ({
      useAuth: createMockHook('useAuth', {
        user: { id: 1, name: 'Test User' },
        isAuthenticated: true,
        logout: createMock()
      })
    }));
  });

  afterAll(() => {
    // Cleanup all mocks after test suite
    mockModules.restoreAll();
  });

  it('renders user information', () => {
    // Test implementation
  });
});
```

### 2. Mock Factory Pattern

Create reusable mock factories for consistent test data across your test suite.

```typescript
// test/factories/userMocks.ts
import { createMockHook, createMock } from '@rageltd/bun-test-utils';

export interface MockUserOptions {
  authenticated?: boolean;
  role?: 'admin' | 'user' | 'guest';
  loading?: boolean;
  error?: Error | null;
}

export function createUserMock(options: MockUserOptions = {}) {
  const {
    authenticated = true,
    role = 'user',
    loading = false,
    error = null
  } = options;

  return createMockHook('useUser', {
    user: authenticated ? {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role
    } : null,
    isAuthenticated: authenticated,
    loading,
    error,
    login: createMock(),
    logout: createMock(),
    refresh: createMock()
  });
}

// Usage in tests
describe('Admin Panel', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks/useAuth', () => ({
      useAuth: createUserMock({ role: 'admin' })
    }));
  });

  it('shows admin controls for admin users', () => {
    // Test admin-specific functionality
  });
});

describe('User Dashboard', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks/useAuth', () => ({
      useAuth: createUserMock({ role: 'user' })
    }));
  });

  it('hides admin controls for regular users', () => {
    // Test user-specific functionality
  });
});
```

### 3. State-Based Testing Pattern

Test components in different states by varying mock return values.

```typescript
describe('DataTable Component', () => {
  const mockModules = createModuleMocker();

  describe('loading state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useData', () => ({
        useData: createMockHook('useData', {
          data: null,
          loading: true,
          error: null,
          refetch: createMock()
        })
      }));
    });

    it('shows loading spinner', () => {
      // Test loading UI
    });

    it('disables interactive elements', () => {
      // Test disabled state
    });
  });

  describe('success state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useData', () => ({
        useData: createMockHook('useData', {
          data: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ],
          loading: false,
          error: null,
          refetch: createMock()
        })
      }));
    });

    it('renders data table', () => {
      // Test data display
    });

    it('enables interactive elements', () => {
      // Test enabled state
    });
  });

  describe('error state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useData', () => ({
        useData: createMockHook('useData', {
          data: null,
          loading: false,
          error: new Error('Failed to load data'),
          refetch: createMock()
        })
      }));
    });

    it('shows error message', () => {
      // Test error UI
    });

    it('provides retry option', () => {
      // Test retry functionality
    });
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

## Advanced Patterns

### 4. Async Testing Pattern

Handle asynchronous operations with proper timing and state verification.

```typescript
import { waitFor } from '@rageltd/bun-test-utils';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Async Form Submission', () => {
  let mockSubmit: ReturnType<typeof createMock>;

  beforeEach(async () => {
    mockSubmit = createMock();

    await mockModules.mock('@/hooks/useForm', () => ({
      useForm: createMockHook('useForm', {
        values: { email: '', password: '' },
        errors: {},
        isSubmitting: false,
        handleSubmit: mockSubmit,
        handleChange: createMock()
      })
    }));
  });

  it('handles successful submission', async () => {
    // Set up successful submission
    mockSubmit.mockImplementation(async (onSubmit) => {
      await waitFor(100); // Simulate API delay
      onSubmit({ success: true });
    });

    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    // Wait for async operation
    await waitFor(150);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('handles submission errors', async () => {
    // Set up error response
    mockSubmit.mockImplementation(async (onSubmit, onError) => {
      await waitFor(100);
      onError(new Error('Invalid credentials'));
    });

    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(150);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
```

### 5. Dynamic Mock Updates Pattern

Change mock behavior during test execution to test different scenarios.

```typescript
describe('Real-time Data Updates', () => {
  let mockUseSocket: ReturnType<typeof createMockHook>;

  beforeEach(async () => {
    mockUseSocket = createMockHook('useSocket', {
      isConnected: false,
      data: null,
      connect: createMock(),
      disconnect: createMock()
    });

    await mockModules.mock('@/hooks/useSocket', () => ({
      useSocket: mockUseSocket
    }));
  });

  it('handles connection state changes', async () => {
    render(<RealtimeComponent />);

    // Initially disconnected
    expect(screen.getByText('Disconnected')).toBeInTheDocument();

    // Simulate connection
    mockUseSocket.mockReturnValue({
      isConnected: true,
      data: { message: 'Hello' },
      connect: createMock(),
      disconnect: createMock()
    });

    // Trigger re-render
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(50);

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### 6. Error Boundary Testing Pattern

Test error handling and recovery mechanisms.

```typescript
describe('Error Boundary Integration', () => {
  beforeEach(async () => {
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('catches and displays component errors', async () => {
    // Mock a hook that throws an error
    await mockModules.mock('@/hooks/useData', () => ({
      useData: createMockHook('useData', {
        get data() {
          throw new Error('Data fetch failed');
        },
        loading: false,
        error: null
      })
    }));

    render(
      <ErrorBoundary>
        <DataComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('allows error recovery', async () => {
    // Start with error state
    let shouldError = true;

    await mockModules.mock('@/hooks/useData', () => ({
      useData: createMockHook('useData', {
        get data() {
          if (shouldError) {
            throw new Error('Data fetch failed');
          }
          return { items: [] };
        },
        loading: false,
        error: null,
        retry: createMock(() => { shouldError = false; })
      })
    }));

    render(
      <ErrorBoundary>
        <DataComponent />
      </ErrorBoundary>
    );

    // Error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Recovery
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    await waitFor(50);

    expect(screen.getByText('Data loaded successfully')).toBeInTheDocument();
  });
});
```

## Testing Hooks Directly

### 7. Custom Hook Testing Pattern

Test custom hooks in isolation using `renderHook` from Testing Library.

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useCounter Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });
});
```

### 8. Hook with Dependencies Testing Pattern

Test hooks that depend on external services or other hooks.

```typescript
describe('useUserProfile Hook', () => {
  beforeEach(async () => {
    await mockModules.mock('@/services/api', () => ({
      fetchUserProfile: createMock(async (id) => ({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`
      }))
    }));
  });

  it('fetches user profile on mount', async () => {
    const { result } = renderHook(() => useUserProfile(1));

    expect(result.current.loading).toBe(true);

    await waitFor(100);

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual({
      id: 1,
      name: 'User 1',
      email: 'user1@example.com'
    });
  });

  it('handles fetch errors', async () => {
    // Override mock to throw error
    await mockModules.mock('@/services/api', () => ({
      fetchUserProfile: createMock(async () => {
        throw new Error('Network error');
      })
    }));

    const { result } = renderHook(() => useUserProfile(1));

    await waitFor(100);

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Network error'));
    expect(result.current.user).toBeNull();
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

## Integration Testing Patterns

### 9. Component Integration Pattern

Test multiple components working together with shared state.

```typescript
describe('User Management Integration', () => {
  let mockUsers: User[];
  let mockUserService: any;

  beforeEach(async () => {
    mockUsers = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ];

    mockUserService = {
      getUsers: createMock(async () => mockUsers),
      deleteUser: createMock(async (id) => {
        mockUsers = mockUsers.filter(user => user.id !== id);
        return { success: true };
      }),
      updateUser: createMock(async (id, data) => {
        const userIndex = mockUsers.findIndex(user => user.id === id);
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
        return mockUsers[userIndex];
      })
    };

    await mockModules.mock('@/services/userService', () => mockUserService);
  });

  it('deletes user and updates list', async () => {
    render(<UserManagementPage />);

    // Wait for users to load
    await waitFor(100);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // Delete Alice
    fireEvent.click(screen.getByRole('button', { name: 'Delete Alice' }));

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(100);

    // Alice should be removed, Bob should remain
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

### 10. Router Integration Pattern

Test components with routing using React Router.

```typescript
import { MemoryRouter } from 'react-router-dom';

describe('Navigation Integration', () => {
  function renderWithRouter(component: React.ReactElement, initialEntries = ['/']) {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    );
  }

  beforeEach(async () => {
    await mockModules.mock('@/hooks/useAuth', () => ({
      useAuth: createMockHook('useAuth', {
        user: { id: 1, role: 'user' },
        isAuthenticated: true
      })
    }));
  });

  it('navigates to user profile', async () => {
    renderWithRouter(<App />, ['/dashboard']);

    fireEvent.click(screen.getByRole('link', { name: 'Profile' }));

    await waitFor(50);

    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  it('redirects unauthenticated users', async () => {
    await mockModules.mock('@/hooks/useAuth', () => ({
      useAuth: createMockHook('useAuth', {
        user: null,
        isAuthenticated: false
      })
    }));

    renderWithRouter(<App />, ['/dashboard']);

    await waitFor(50);

    expect(screen.getByText('Please log in')).toBeInTheDocument();
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

## Performance Testing Patterns

### 11. Performance Testing Pattern

Test component performance characteristics and optimization effectiveness.

```typescript
describe('Performance Tests', () => {
  it('renders large lists efficiently', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }));

    await mockModules.mock('@/hooks/useData', () => ({
      useData: createMockHook('useData', {
        data: largeDataset,
        loading: false,
        error: null
      })
    }));

    const start = performance.now();
    
    render(<VirtualizedList />);

    const renderTime = performance.now() - start;

    // Should render within reasonable time
    expect(renderTime).toBeLessThan(100);

    // Should not render all items at once (virtualization)
    const renderedItems = screen.getAllByTestId(/list-item-/);
    expect(renderedItems.length).toBeLessThan(largeDataset.length);
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

## Best Practices Summary

### Do's

- ✅ Use `setupTestCleanup()` in every test file
- ✅ Create reusable mock factories for common data
- ✅ Test all component states (loading, success, error)
- ✅ Use descriptive test names that explain the scenario
- ✅ Mock at the right level (module boundaries)
- ✅ Clean up mocks after each test suite
- ✅ Use `waitFor()` for async operations
- ✅ Test user interactions, not implementation details

### Don'ts

- ❌ Don't mock internal implementation details
- ❌ Don't write tests that test the mock instead of the component
- ❌ Don't forget to restore mocks after tests
- ❌ Don't use arbitrary timeouts without justification
- ❌ Don't test multiple concerns in a single test
- ❌ Don't rely on test execution order
- ❌ Don't mock everything - mock at boundaries

### Quick Checklist

Before writing tests, ask yourself:

1. What behavior am I testing?
2. What are the different states/scenarios?
3. What dependencies need mocking?
4. How do I ensure test isolation?
5. What user interactions should I test?
6. What edge cases exist?
7. How do I verify the expected outcome?

Following these patterns will help you create robust, maintainable test suites that provide confidence in your code quality and catch regressions effectively.