# Semantic Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation. This guide explains how to write proper commit messages that will trigger appropriate releases.

## Why Semantic Commits?

Semantic commits enable:

- **Automated Versioning** - Determine version bumps based on commit types
- **Automatic Changelog** - Generate release notes from commit messages
- **Clear History** - Understand the nature of changes at a glance
- **Release Automation** - Trigger releases without manual intervention

## Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Structure Breakdown

- **Type**: The kind of change (required)
- **Scope**: The area of code affected (optional)
- **Description**: Brief summary of the change (required)
- **Body**: Detailed explanation (optional)
- **Footer**: Breaking changes, issue references (optional)

## Commit Types

### Release-Triggering Types

These commit types will trigger automated releases:

#### `fix:` - Patch Release (1.0.x)

Bug fixes that don't change the public API.

```bash
fix: resolve mock cleanup issue in module mocker
fix(async): handle timeout edge case in waitFor utility
```

#### `feat:` - Minor Release (1.x.0)

New features that are backwards compatible.

```bash
feat: add createPartialMock utility for type-safe partial mocking
feat(graphql): support lazy query mocking with loading states
```

#### Breaking Changes - Major Release (x.0.0)

Use `BREAKING CHANGE:` in the footer or `!` after the type.

```bash
feat!: redesign module mocker API for better type safety

BREAKING CHANGE: createModuleMocker now returns a different interface
```

```bash
refactor: simplify hook mocking interface

BREAKING CHANGE: createMockHook signature has changed from 
createMockHook(name, value) to createMockHook(value, options)
```

### Non-Release Types

These types don't trigger releases but are still important:

#### `docs:` - Documentation

```bash
docs: add examples for GraphQL testing patterns
docs(api): improve JSDoc comments for async utilities
```

#### `style:` - Code Style

```bash
style: fix linting issues in test files
style: update prettier configuration
```

#### `refactor:` - Code Refactoring

```bash
refactor: extract common test setup logic
refactor(tests): simplify mock creation patterns
```

#### `test:` - Adding Tests

```bash
test: add edge case tests for module restoration
test(integration): add end-to-end testing scenarios
```

#### `chore:` - Maintenance

```bash
chore: update dependencies to latest versions
chore(ci): improve GitHub Actions workflow
```

#### `perf:` - Performance Improvements

```bash
perf: optimize mock cleanup performance
perf(async): reduce waitFor overhead
```

## Scopes

Use scopes to indicate the area of code affected:

### Common Scopes

- `async` - Async utilities
- `mock` - Mock utilities
- `hooks` - Hook mocking
- `graphql` - GraphQL utilities
- `module` - Module mocking
- `cleanup` - Cleanup utilities
- `types` - TypeScript types
- `docs` - Documentation
- `ci` - Continuous Integration
- `deps` - Dependencies

### Examples with Scopes

```bash
feat(async): add timeout option to waitFor function
fix(hooks): resolve type inference in createMockHook
docs(api): add comprehensive examples for all utilities
test(graphql): add tests for error state mocking
```

## Writing Good Commit Messages

### 1. Use Present Tense

```bash
# ✅ Good
feat: add new utility function

# ❌ Avoid
feat: added new utility function
feat: adding new utility function
```

### 2. Be Concise but Descriptive

```bash
# ✅ Good
fix: resolve memory leak in module restoration

# ❌ Too vague
fix: fix bug

# ❌ Too verbose
fix: resolve the memory leak that occurs when restoring modules in certain edge cases where cleanup is not properly handled
```

### 3. Use Imperative Mood

Write as if giving a command:

```bash
# ✅ Good
feat: add support for async hook mocking
fix: prevent mock pollution between tests

# ❌ Avoid
feat: adds support for async hook mocking
fix: prevents mock pollution between tests
```

### 4. Include Context in Body

For complex changes, use the body to explain why:

```bash
feat: add createPartialMock utility

This utility allows creating type-safe partial mocks of complex objects,
which is particularly useful when testing components that depend on
large configuration objects or API responses where only a subset of
properties are relevant to the test.
```

## Breaking Changes

### When to Use Breaking Changes

- Changing function signatures
- Removing public APIs
- Changing default behavior
- Renaming exported functions/classes

### How to Document Breaking Changes

```bash
feat!: redesign module mocking API

BREAKING CHANGE: The createModuleMocker function now returns an object
with different method names:
- mockModule() is now mock()
- restoreModule() is now restore()
- restoreAllModules() is now restoreAll()

Migration guide:
```typescript
// Before
const mocker = createModuleMocker();
await mocker.mockModule('@/hooks', () => ({}));
mocker.restoreModule('@/hooks');
mocker.restoreAllModules();

// After  
const mocker = createModuleMocker();
await mocker.mock('@/hooks', () => ({}));
mocker.restore('@/hooks');
mocker.restoreAll();
```

## Using the Interactive Commit Tool

This project includes an interactive commit tool to help you write proper commits:

```bash
bun run commit
```

The tool will:

1. **Prompt for commit type** - Choose from available types
2. **Ask for scope** - Select affected area (optional)
3. **Request description** - Write a brief summary
4. **Allow detailed body** - Add explanation if needed
5. **Handle breaking changes** - Mark and describe breaking changes
6. **Reference issues** - Link to GitHub issues

### Example Interactive Session

```
? Select the type of change you're committing: feat
? What is the scope of this change? (press enter to skip): async
? Write a short, imperative description: add timeout support to waitFor
? Provide a longer description: (press enter to skip)
? Are there any breaking changes? No
? Does this change affect any open issues? (press enter to skip)

Generated commit message:
feat(async): add timeout support to waitFor
```

## Examples

### Feature Addition

```bash
feat(graphql): add support for subscription mocking

Add createMockSubscription utility that handles GraphQL subscription
mocking with proper cleanup and error simulation.

Closes #123
```

### Bug Fix

```bash
fix(module): prevent duplicate module restoration

Fixes issue where calling restoreAll() multiple times would attempt
to restore already restored modules, causing test failures.

Fixes #456
```

### Breaking Change

```bash
feat!: simplify hook mocking API

BREAKING CHANGE: createMockHook now accepts options as second parameter
instead of separate arguments. This provides better type safety and
extensibility.

Before: createMockHook('useUser', userData, { persist: true })
After: createMockHook('useUser', { returnValue: userData, persist: true })
```

### Documentation

```bash
docs: add comprehensive testing patterns guide

Include examples for:
- Module mocking best practices
- Hook testing strategies  
- GraphQL operation mocking
- Async testing patterns
```

## Validation

### Pre-commit Hooks

The project uses [Lefthook](https://github.com/evilmartians/lefthook) to validate commit messages:

- **Format validation** - Ensures conventional commit format
- **Type validation** - Verifies valid commit types
- **Length limits** - Enforces reasonable message lengths

### CI Validation

GitHub Actions also validate commit messages on pull requests to ensure consistency across the project.

## Best Practices

### 1. One Logical Change Per Commit

```bash
# ✅ Good - single focused change
feat: add createSpy utility for method spying

# ❌ Avoid - multiple unrelated changes  
feat: add createSpy utility and fix documentation and update dependencies
```

### 2. Commit Frequently

Make small, incremental commits rather than large monolithic ones:

```bash
feat: add basic spy utility structure
feat: implement spy creation logic  
feat: add spy cleanup functionality
test: add comprehensive spy utility tests
docs: document spy utility API
```

### 3. Test Before Committing

Ensure your changes work:

```bash
# Run tests
bun test

# Run linting
bun run lint

# Then commit
git add .
bun run commit
```

### 4. Link to Issues

Reference GitHub issues when relevant:

```bash
fix: resolve mock restoration timing issue

Fixes #789
Closes #790
```

## Common Mistakes

### 1. Wrong Commit Type

```bash
# ❌ Wrong - this is a feature, not a fix
fix: add new utility function

# ✅ Correct  
feat: add new utility function
```

### 2. Missing Breaking Change Notation

```bash
# ❌ Wrong - breaking change not marked
refactor: change module mocker API

# ✅ Correct
refactor!: change module mocker API

BREAKING CHANGE: Method signatures have changed
```

### 3. Unclear Descriptions

```bash
# ❌ Unclear
fix: fix thing

# ✅ Clear
fix(async): resolve timeout handling in waitFor utility
```

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Commitizen](https://github.com/commitizen/cz-cli) - Command line utility

## Getting Help

If you're unsure about commit message formatting:

1. Use the interactive tool: `bun run commit`
2. Check recent commits for examples: `git log --oneline`
3. Ask in pull request discussions
4. Refer to this guide and the conventional commits specification