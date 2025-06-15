# @rageltd/bun-test-utils

A comprehensive collection of test utilities designed specifically for Bun projects, providing solutions for common testing challenges and streamlined mocking patterns.

## Overview

This library addresses the unique testing needs of Bun applications by providing:

- **Robust Mocking Utilities** - Work around known issues in `bun:test` mocking
- **React Testing Helpers** - Streamlined component and hook mocking
- **GraphQL Testing Support** - Mock GraphQL operations with ease
- **Async Testing Tools** - Handle asynchronous operations in tests
- **Cleanup Management** - Automatic test isolation and cleanup

## Why This Library?

Bun's testing framework is powerful but has some rough edges, particularly around module mocking and cleanup. This library provides battle-tested utilities that:

1. **Handle Bun-specific Issues** - Works around known bugs in `bun:test`
2. **Reduce Boilerplate** - Common testing patterns made simple
3. **Ensure Test Isolation** - Proper cleanup and mock restoration
4. **Type Safety** - Full TypeScript support with proper typing
5. **Performance Focused** - Built with Bun's performance in mind

## Key Features

### 🚀 **Module Mocking**
Properly handle module mocking with automatic cleanup and restoration, working around `bun:test` limitations.

### 🎯 **React Testing**
Streamlined utilities for mocking React components and hooks with minimal setup.

### 🔍 **GraphQL Support**
Mock GraphQL operations including queries, mutations, lazy queries, and error states.

### ⚡ **Async Utilities**
Tools for handling asynchronous operations and timing in tests.

### 🧹 **Cleanup Management**
Automatic cleanup utilities to ensure proper test isolation.

## Quick Example

```typescript
import { 
  createModuleMocker, 
  createMockHook,
  setupTestCleanup 
} from '@rageltd/bun-test-utils';

// Setup automatic cleanup
setupTestCleanup();

const mockModules = createModuleMocker();

describe('User Component', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks', () => ({
      useUser: createMockHook('useUser', { 
        id: 1, 
        name: 'Test User' 
      })
    }));
  });

  afterAll(() => {
    mockModules.restoreAll();
  });

  it('should render user information', () => {
    // Your test here - mocks are properly isolated
  });
});
```

## Browser Compatibility

This library is designed for:
- **Bun runtime** - Primary target
- **Node.js** - Compatible for CI/CD environments
- **Modern TypeScript/JavaScript** - ESM and CommonJS support

## Next Steps

- [Installation](getting-started/installation.md) - Get started with the library
- [Quick Start](getting-started/quick-start.md) - Your first test with the utilities
- [API Reference](api-reference/) - Complete function documentation
- [Examples](examples/) - Real-world usage patterns