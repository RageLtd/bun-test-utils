# Module Mocking

The module mocking utilities provide robust solutions for mocking entire modules in Bun tests, working around known issues in `bun:test` and ensuring proper cleanup and restoration.

## createModuleMocker

### Signature

```typescript
function createModuleMocker(): ModuleMocker
```

### Description

Creates a module mocker instance that handles the complexities of module mocking in Bun, including proper restoration and cleanup. This utility works around the known bug in `bun:test` where `mock.restore()` doesn't properly restore modules that were mocked with `mock.module()`.

### Returns

`ModuleMocker` - An object with methods for mocking and restoring modules

#### ModuleMocker Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `mock` | `async mock(modulePath: string, implementation: () => any): Promise<void>` | Mock a module with the given implementation |
| `restore` | `restore(modulePath: string): void` | Restore a specific module to its original state |
| `restoreAll` | `restoreAll(): void` | Restore all mocked modules to their original state |

### Examples

#### Basic Module Mocking

```typescript
import { createModuleMocker, createMockHook } from '@rageltd/bun-test-utils';
import { test, expect, beforeEach, afterAll } from 'bun:test';

const mockModules = createModuleMocker();

describe('User Component Tests', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks/useUser', () => ({
      useUser: createMockHook('useUser', {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      })
    }));
  });

  afterAll(() => {
    mockModules.restoreAll();
  });

  test('renders with mocked user data', () => {
    // Component will use the mocked hook
    expect(true).toBe(true); // Your actual test here
  });
});
```

#### Mocking Multiple Modules

```typescript
import { createModuleMocker, createMockHook, createMock } from '@rageltd/bun-test-utils';

const mockModules = createModuleMocker();

describe('Complex Component Tests', () => {
  beforeEach(async () => {
    // Mock hooks module
    await mockModules.mock('@/hooks', () => ({
      useAuth: createMockHook('useAuth', {
        user: { id: 1, role: 'admin' },
        isAuthenticated: true,
        logout: createMock()
      }),
      useNotifications: createMockHook('useNotifications', {
        notifications: [],
        unreadCount: 0
      })
    }));

    // Mock utilities module
    await mockModules.mock('@/utils/api', () => ({
      fetchUser: createMock(async (id) => ({ id, name: `User ${id}` })),
      updateUser: createMock(async (id, data) => ({ id, ...data }))
    }));

    // Mock constants
    await mockModules.mock('@/constants', () => ({
      API_BASE_URL: 'http://localhost:3000',
      DEFAULT_TIMEOUT: 5000
    }));
  });

  afterAll(() => {
    mockModules.restoreAll();
  });

  test('handles complex interactions', () => {
    // All modules are properly mocked
  });
});
```

#### Selective Module Restoration

```typescript
const mockModules = createModuleMocker();

describe('Module Restoration Tests', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks/useUser', () => ({
      useUser: createMockHook('useUser', { id: 1, name: 'Test' })
    }));

    await mockModules.mock('@/utils/helpers', () => ({
      formatDate: createMock((date) => '2023-01-01'),
      validateEmail: createMock(() => true)
    }));
  });

  test('can restore individual modules', async () => {
    // Restore only the hooks module
    mockModules.restore('@/hooks/useUser');

    // Re-mock with different implementation
    await mockModules.mock('@/hooks/useUser', () => ({
      useUser: createMockHook('useUser', { id: 2, name: 'Different User' })
    }));

    // The utils module is still mocked with original implementation
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

## restoreModules

### Signature

```typescript
function restoreModules(modulesMap: Record<string, unknown>): void
```

### Description

Manually restore multiple modules to their original state. This is useful when you want to store original modules upfront and restore them later, providing an alternative pattern to `createModuleMocker`.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `modulesMap` | `Record<string, unknown>` | Map of module paths to their original implementations |

### Examples

#### Manual Module Restoration Pattern

```typescript
import { restoreModules } from '@rageltd/bun-test-utils';

// Store original modules at the top of your test file
const originals = {
  hooks: await import('@/hooks'),
  utils: await import('@/utils/api'),
  constants: await import('@/constants')
};

describe('Manual Restoration Tests', () => {
  beforeEach(async () => {
    // Mock modules as needed
    mock.module('@/hooks', () => ({
      useUser: createMockHook('useUser', { id: 1 })
    }));
  });

  afterAll(() => {
    // Restore all original modules
    restoreModules({
      '@/hooks': originals.hooks,
      '@/utils/api': originals.utils,
      '@/constants': originals.constants
    });
  });

  test('uses manual restoration', () => {
    // Your test here
  });
});
```

#### Conditional Module Restoration

```typescript
const originals = {
  prodUtils: await import('@/utils/production'),
  testUtils: await import('@/utils/testing')
};

describe('Environment-specific Tests', () => {
  afterEach(() => {
    if (process.env.NODE_ENV === 'production') {
      restoreModules({
        '@/utils': originals.prodUtils
      });
    } else {
      restoreModules({
        '@/utils': originals.testUtils
      });
    }
  });

  test('handles different environments', () => {
    // Test logic here
  });
});
```

## Advanced Usage

### Dynamic Module Mocking

```typescript
const mockModules = createModuleMocker();

describe('Dynamic Mocking Tests', () => {
  test('changes module behavior during test', async () => {
    // Initial mock
    await mockModules.mock('@/services/api', () => ({
      fetchData: createMock(() => ({ status: 'success', data: [] }))
    }));

    // Test with success response
    // ... test logic ...

    // Change to error response
    await mockModules.mock('@/services/api', () => ({
      fetchData: createMock(() => {
        throw new Error('API Error');
      })
    }));

    // Test with error response
    // ... test logic ...
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

### Nested Module Mocking

```typescript
const mockModules = createModuleMocker();

describe('Nested Module Tests', () => {
  beforeEach(async () => {
    // Mock a module that exports an object with nested functions
    await mockModules.mock('@/services', () => ({
      UserService: {
        getUser: createMock(async (id) => ({ id, name: `User ${id}` })),
        updateUser: createMock(async (id, data) => ({ id, ...data })),
        deleteUser: createMock(async (id) => ({ success: true }))
      },
      EmailService: {
        sendEmail: createMock(async (to, subject, body) => ({ messageId: '123' })),
        validateEmail: createMock((email) => email.includes('@'))
      }
    }));
  });

  test('mocks nested service methods', () => {
    // All nested methods are properly mocked
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

### Module Mocking with Type Safety

```typescript
interface ApiModule {
  fetchUser: (id: number) => Promise<User>;
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (id: number, data: UpdateUserData) => Promise<User>;
}

const mockModules = createModuleMocker();

describe('Type-Safe Module Mocking', () => {
  beforeEach(async () => {
    await mockModules.mock('@/api', (): ApiModule => ({
      fetchUser: createMock(async (id: number) => ({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        createdAt: new Date()
      })),
      
      createUser: createMock(async (data: CreateUserData) => ({
        id: Math.random(),
        ...data,
        createdAt: new Date()
      })),
      
      updateUser: createMock(async (id: number, data: UpdateUserData) => ({
        id,
        ...data,
        updatedAt: new Date()
      }))
    }));
  });

  test('uses type-safe mocked module', () => {
    // TypeScript will ensure correct usage
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

## Best Practices

### 1. Use Consistent Cleanup Patterns

```typescript
// ✅ Good - consistent cleanup
const mockModules = createModuleMocker();

afterAll(() => {
  mockModules.restoreAll();
});

// ✅ Also good - manual cleanup
afterAll(() => {
  restoreModules(originalModules);
});
```

### 2. Mock at the Right Level

```typescript
// ✅ Good - mock at module boundary
await mockModules.mock('@/hooks', () => ({
  useUser: createMockHook('useUser', userData)
}));

// ❌ Avoid - mocking internal implementation details
await mockModules.mock('@/hooks/useUser/internal', () => ({}));
```

### 3. Keep Mock Implementations Simple

```typescript
// ✅ Good - simple, focused mock
await mockModules.mock('@/utils/date', () => ({
  formatDate: createMock((date) => '2023-01-01'),
  parseDate: createMock((str) => new Date(str))
}));

// ❌ Avoid - complex mock logic
await mockModules.mock('@/utils/date', () => ({
  formatDate: createMock((date) => {
    // Complex formatting logic that could have bugs
    if (typeof date === 'string') {
      date = new Date(date);
    }
    // ... many more lines
  })
}));
```

### 4. Use Descriptive Mock Data

```typescript
// ✅ Good - descriptive mock data
await mockModules.mock('@/services/user', () => ({
  getCurrentUser: createMock(() => ({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    lastLogin: new Date('2023-01-01')
  }))
}));

// ❌ Avoid - generic mock data
await mockModules.mock('@/services/user', () => ({
  getCurrentUser: createMock(() => ({ id: 1, name: 'test' }))
}));
```

## Common Patterns

### Test Suite Setup Pattern

```typescript
import { createModuleMocker, setupTestCleanup } from '@rageltd/bun-test-utils';

// Global setup
setupTestCleanup();
const mockModules = createModuleMocker();

// Reusable mock factory
async function setupCommonMocks() {
  await mockModules.mock('@/hooks/useAuth', () => ({
    useAuth: createMockHook('useAuth', defaultAuthState)
  }));
  
  await mockModules.mock('@/utils/api', () => ({
    request: createMock(defaultApiResponse)
  }));
}

describe('Feature Tests', () => {
  beforeEach(setupCommonMocks);
  afterAll(() => mockModules.restoreAll());

  // Individual tests here
});
```

### Environment-Specific Mocking

```typescript
const mockModules = createModuleMocker();

function createEnvironmentMocks(env: 'development' | 'production' | 'test') {
  const configs = {
    development: {
      API_URL: 'http://localhost:3000',
      DEBUG: true
    },
    production: {
      API_URL: 'https://api.example.com',
      DEBUG: false
    },
    test: {
      API_URL: 'http://test-api.example.com',
      DEBUG: true
    }
  };

  return mockModules.mock('@/config', () => configs[env]);
}

describe('Environment Tests', () => {
  test('development environment', async () => {
    await createEnvironmentMocks('development');
    // Test with development config
  });

  test('production environment', async () => {
    await createEnvironmentMocks('production');
    // Test with production config
  });

  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

## Troubleshooting

### Module Path Issues

```typescript
// ❌ Problem: Incorrect module path
await mockModules.mock('./hooks', () => ({})); // Relative path might not work

// ✅ Solution: Use absolute path
await mockModules.mock('@/hooks', () => ({})); // Use configured alias
```

### Mock Not Taking Effect

```typescript
// ❌ Problem: Mock applied after import
import { useUser } from '@/hooks'; // Import happens first
await mockModules.mock('@/hooks', () => ({ useUser: mockHook })); // Too late

// ✅ Solution: Mock before any imports that use the module
await mockModules.mock('@/hooks', () => ({ useUser: mockHook }));
// Now imports will get the mocked version
```

### Memory Leaks from Unrestored Mocks

```typescript
// ❌ Problem: Forgetting to restore mocks
describe('Tests', () => {
  beforeEach(async () => {
    await mockModules.mock('@/module', () => ({}));
  });
  // Missing afterAll cleanup
});

// ✅ Solution: Always clean up
describe('Tests', () => {
  beforeEach(async () => {
    await mockModules.mock('@/module', () => ({}));
  });
  
  afterAll(() => {
    mockModules.restoreAll();
  });
});
```

## See Also

- [Hook Mocking](hook-mocking.md) - For mocking React hooks specifically
- [Cleanup Utilities](cleanup-utilities.md) - For automatic test cleanup
- [Testing Patterns](../guides/testing-patterns.md) - Advanced module mocking patterns
- [Working with Bun](../guides/working-with-bun.md) - Bun-specific mocking considerations