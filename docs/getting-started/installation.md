# Installation

This guide will help you install and set up `@rageltd/bun-test-utils` in your project.

## Prerequisites

- **Bun** v1.0.0 or higher
- **TypeScript** (recommended) or JavaScript
- A Bun project with testing configured

## Install the Package

### From npm Registry

```bash
bun install @rageltd/bun-test-utils
```

### From GitHub Package Registry

If you prefer to install from GitHub's package registry:

```bash
# Configure npm to use GitHub Package Registry for this scope
echo "@rageltd:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install the package
bun install @rageltd/bun-test-utils
```

## Verify Installation

Create a simple test file to verify the installation:

```typescript
// test/verify-installation.test.ts
import { test, expect } from 'bun:test';
import { waitFor, createMock } from '@rageltd/bun-test-utils';

test('bun-test-utils is working', async () => {
  const mockFn = createMock();
  
  await waitFor(10);
  
  expect(mockFn).toBeDefined();
});
```

Run the test:

```bash
bun test test/verify-installation.test.ts
```

## TypeScript Configuration

If you're using TypeScript, ensure your `tsconfig.json` includes the necessary configuration:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,
    "types": ["bun-types"]
  }
}
```

## Package.json Scripts

Add helpful scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage"
  }
}
```

## Project Structure

Organize your tests in a logical structure:

```
your-project/
├── src/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── test/
│   ├── __mocks__/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── package.json
└── tsconfig.json
```

## Next Steps

- [Quick Start Guide](quick-start.md) - Write your first test
- [API Reference](../api-reference/) - Explore available utilities
- [Testing Patterns](../guides/testing-patterns.md) - Learn best practices