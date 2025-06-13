# @rageltd/bun-test-utils

![Tests](https://github.com/rageltd/bun-test-utils/workflows/Pull%20Request%20Tests/badge.svg)
![Publish](https://github.com/rageltd/bun-test-utils/workflows/Test%20and%20Publish/badge.svg)
![npm](https://img.shields.io/npm/v/@rageltd/bun-test-utils)

A collection of test utilities for Bun projects, designed to work around common issues with `bun:test` mocking and provide helpful testing patterns.

## Installation

### From npm

```bash
bun install @rageltd/bun-test-utils
```

### From GitHub Package Registry

```bash
# Configure npm to use GitHub Package Registry for this scope
echo "@rageltd:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install the package
bun install @rageltd/bun-test-utils
```

## Usage

### In TypeScript Projects

```typescript
import { createMockHook, createModuleMocker, waitFor } from '@rageltd/bun-test-utils';

// Create mock hooks
const mockUserHook = createMockHook('useUser', { id: 1, name: 'Test User' });

// Create module mockers
const mockModules = createModuleMocker();
```

### In JavaScript Projects

This package is built to work with both TypeScript and JavaScript projects:

```javascript
// ESM import
import { createMockHook, createMock, waitFor } from '@rageltd/bun-test-utils';

// CommonJS require (if needed)
const { createMockHook, createMock } = require('@rageltd/bun-test-utils');
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

### 🔄 Pull Request Workflow
- **Triggers**: On pull requests to `main` branch
- **Actions**: 
  - Runs tests on multiple Bun versions (1.0.0, latest)
  - Performs linting with Biome
  - Builds the package
  - Tests build outputs
  - Comments on PR when tests pass

### 🚀 Publish Workflow  
- **Triggers**: On push to `main` branch or published releases
- **Actions**:
  - Runs all tests
  - Builds the package
  - Publishes to GitHub Package Registry
  - Publishes to npm (on releases)

### 🤖 Dependabot Auto-Merge
- **NPM packages**: Weekly updates on Mondays
- **GitHub Actions**: Weekly updates on Mondays
- **Auto-merge behavior**:
  - ✅ **Auto-merged**: Patch and minor updates, all dev dependencies
  - ⚠️ **Auto-approved only**: Major production dependency updates (requires manual merge)
  - ❌ **No action**: PRs where tests fail (requires manual review)

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

### Testing

```bash
# Run all tests
bun test

# Run linting
bun run lint

# Fix linting issues
bun run lint:fix
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
- ⚡ Automated CI/CD with GitHub Actions
- 🔍 Code quality checks with Biome

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `bun install` (this automatically sets up git hooks)
4. Make your changes and add tests
5. Run tests: `bun test`
6. Run linting: `bun run lint`
7. Commit your changes using conventional commits format or use: `bun run commit`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Git Hooks (Lefthook)

This project uses [Lefthook](https://github.com/evilmartians/lefthook) for managing git hooks:

- **Pre-commit**: Runs linting and tests before commits
- **Commit-msg**: Enforces conventional commit message format
- **Pre-push**: Runs tests and build before pushing

**Auto-installation**: Git hooks are automatically installed when you run `bun install`. No manual setup required!

The auto-install system:
- ✅ Detects if you're in a git repository
- ✅ Checks if hooks are already installed
- ✅ Automatically installs missing hooks
- ✅ Skips installation in non-git environments
- ✅ Runs seamlessly during `bun install`

### Conventional Commits

This project enforces [Conventional Commits](https://www.conventionalcommits.org/). Use the interactive commit tool:
```bash
bun run commit
```

Or format commits manually:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The CI will automatically run tests and provide feedback on your PR!

This project was created using `bun init` in bun v1.2.16. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
