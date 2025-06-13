# bun-test-utils

A collection of test utilities for Bun projects, designed to work around common issues with `bun:test` mocking and provide helpful testing patterns.

## Installation

```bash
bun install bun-test-utils
```

## Usage

### In TypeScript Projects

```typescript
import { createMockHook, createModuleMocker, waitFor } from 'bun-test-utils';

// Create mock hooks
const mockUserHook = createMockHook('useUser', { id: 1, name: 'Test User' });

// Create module mockers
const mockModules = createModuleMocker();
```

### In JavaScript Projects

This package is built to work with both TypeScript and JavaScript projects:

```javascript
// ESM import
import { createMockHook, createMock, waitFor } from 'bun-test-utils';

// CommonJS require (if needed)
const { createMockHook, createMock } = require('bun-test-utils');
```

## Development

### Installing Dependencies

```bash
bun install
```

### Building the Package

The package includes a comprehensive build system that generates both CommonJS and ESM outputs:

```bash
# Build everything (ESM, CJS, and type declarations)
bun run build

# Build individual formats
bun run build:esm    # ESM output
bun run build:cjs    # CommonJS output  
bun run build:types  # TypeScript declarations

# Clean build output
bun run build:clean

# Watch mode for development
bun run dev
```

### Build Output

The build process creates the following files in the `dist/` directory:

- `index.js` - ESM bundle
- `index.cjs` - CommonJS bundle  
- `index.d.ts` - TypeScript declarations
- `src/` - Individual type declaration files

### Testing the Build

```bash
# Test both CommonJS and ESM builds
bun run test:build
```

## Package Configuration

The package is configured with proper entry points for different module systems:

- **Main**: `dist/index.js` (ESM)
- **Types**: `dist/index.d.ts`
- **Exports**: Supports both `import` and `require`

This ensures compatibility with:
- Modern TypeScript/JavaScript projects using ESM
- Legacy projects using CommonJS
- Bundlers like Webpack, Rollup, Vite
- Node.js projects

## Features

- 🚀 Built with Bun for maximum performance
- 📦 Dual package (ESM + CommonJS) for maximum compatibility
- 🔧 Full TypeScript support with generated declarations
- 🧪 Comprehensive test utilities for Bun projects
- 📖 Well-documented API with examples

This project was created using `bun init` in bun v1.2.16. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
