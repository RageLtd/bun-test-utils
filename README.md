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

### Module Mocking

#### `createModuleMocker(): ModuleMocker`
Create a module mocker with proper cleanup for handling bun:test mocking issues.

```typescript
import { createModuleMocker } from '@rageltd/bun-test-utils';

const mockModules = createModuleMocker();

// Mock a module
await mockModules.mock('@/hooks', () => ({
  useUser: () => ({ id: 1, name: 'Test User' })
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

#### `clearMockRegistry(): void`
Clear the mock registry (useful for test cleanup).

```typescript
import { clearMockRegistry } from '@rageltd/bun-test-utils';

afterEach(() => {
  clearMockRegistry();
});
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
  createModuleMocker, 
  setupTestCleanup,
  clearMockRegistry
} from '@rageltd/bun-test-utils';

// Setup cleanup once per file
setupTestCleanup();

const mockModules = createModuleMocker();

describe('Component Tests', () => {
  beforeEach(async () => {
    await mockModules.mock('@/hooks', () => ({
      useUser: () => ({ id: 1, name: 'Test User' })
    }));
  });

  afterEach(() => {
    clearMockRegistry();
  });

  afterAll(() => {
    mockModules.restoreAll();
  });

  it('should handle mocked modules', () => {
    // Your test here
  });
});
```

### Using withMockCleanup Pattern

```typescript
import { withMockCleanup, createModuleMocker } from '@rageltd/bun-test-utils';

withMockCleanup(() => {
  describe('My Test Suite', () => {
    const mockModules = createModuleMocker();

    beforeEach(async () => {
      await mockModules.mock('@/services', () => ({
        apiService: { getData: () => Promise.resolve({ data: 'test' }) }
      }));
    });

    it('should work with automatic cleanup', () => {
      // Test implementation
    });
  });
});
```

## Known Issues

This package addresses the known bug in bun:test where `mock.restore()` doesn't properly restore modules that were mocked with `mock.module()`.

See: https://github.com/oven-sh/bun/issues/7823

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
- 🧪 Module mocking utilities
- 🔄 Automatic cleanup utilities
- ⚡ Automated CI/CD with semantic versioning