# Async Utilities

The async utilities module provides tools for handling asynchronous operations in tests, making it easier to work with timing-dependent code and async workflows.

## waitFor

### Signature

```typescript
function waitFor(ms?: number): Promise<void>
```

### Description

A utility function that creates a promise that resolves after a specified number of milliseconds. This is particularly useful for:

- Waiting for async operations to complete
- Simulating delays in tests
- Allowing React components to update
- Testing timing-dependent behavior

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ms` | `number` | `0` | Number of milliseconds to wait |

### Returns

`Promise<void>` - A promise that resolves after the specified time

### Examples

#### Basic Usage

```typescript
import { waitFor } from '@rageltd/bun-test-utils';
import { test, expect } from 'bun:test';

test('waits for async operations', async () => {
  const start = Date.now();
  
  await waitFor(100);
  
  const elapsed = Date.now() - start;
  expect(elapsed).toBeGreaterThanOrEqual(100);
});
```

#### Testing Async Components

```typescript
import { render, screen } from '@testing-library/react';
import { waitFor } from '@rageltd/bun-test-utils';

test('waits for component to update', async () => {
  render(<AsyncComponent />);
  
  // Wait for component to finish loading
  await waitFor(100);
  
  expect(screen.getByText('Loaded!')).toBeInTheDocument();
});
```

#### Next Tick (Default Behavior)

```typescript
import { waitFor } from '@rageltd/bun-test-utils';

test('waits for next tick', async () => {
  let updated = false;
  
  // Schedule something for next tick
  setTimeout(() => { updated = true; }, 0);
  
  // Wait for next tick (default 0ms)
  await waitFor();
  
  expect(updated).toBe(true);
});
```

#### Testing Debounced Functions

```typescript
import { waitFor } from '@rageltd/bun-test-utils';

test('tests debounced function', async () => {
  const mockFn = createMock();
  const debouncedFn = debounce(mockFn, 50);
  
  // Call multiple times
  debouncedFn('first');
  debouncedFn('second');
  debouncedFn('third');
  
  // Wait for debounce period
  await waitFor(60);
  
  // Should only be called once with the last value
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn).toHaveBeenCalledWith('third');
});
```

#### Testing Animation Timings

```typescript
import { waitFor } from '@rageltd/bun-test-utils';

test('tests animation completion', async () => {
  const element = document.createElement('div');
  element.style.transition = 'opacity 200ms';
  element.style.opacity = '0';
  
  document.body.appendChild(element);
  
  // Trigger animation
  element.style.opacity = '1';
  
  // Wait for animation to complete
  await waitFor(250);
  
  expect(getComputedStyle(element).opacity).toBe('1');
});
```

## Best Practices

### 1. Use Minimal Wait Times

Only wait as long as necessary to avoid slow tests:

```typescript
// ❌ Avoid unnecessarily long waits
await waitFor(5000);

// ✅ Use minimal required time
await waitFor(100);
```

### 2. Combine with Testing Library Utilities

For React testing, prefer `@testing-library/react`'s async utilities when possible:

```typescript
import { waitFor as waitForElement } from '@testing-library/react';
import { waitFor } from '@rageltd/bun-test-utils';

// ✅ For DOM changes, use testing-library
await waitForElement(() => screen.getByText('Loaded'));

// ✅ For timing/delays, use bun-test-utils
await waitFor(100);
```

### 3. Document Wait Reasons

Add comments explaining why you're waiting:

```typescript
// Wait for debounce period to complete
await waitFor(300);

// Allow React to flush state updates
await waitFor();
```

### 4. Consider Alternatives

Before using `waitFor`, consider if there are better alternatives:

```typescript
// ❌ Waiting for arbitrary time
await waitFor(1000);
expect(element).toHaveClass('loaded');

// ✅ Waiting for specific condition
await waitForElement(() => 
  expect(element).toHaveClass('loaded')
);
```

## Common Use Cases

### Testing Async State Updates

```typescript
test('handles async state updates', async () => {
  const { result } = renderHook(() => useAsyncData());
  
  act(() => {
    result.current.fetch();
  });
  
  // Wait for async operation
  await waitFor(100);
  
  expect(result.current.data).toBeDefined();
});
```

### Testing Timers and Intervals

```typescript
test('tests interval behavior', async () => {
  const mockCallback = createMock();
  
  const intervalId = setInterval(mockCallback, 100);
  
  // Wait for multiple intervals
  await waitFor(350);
  
  clearInterval(intervalId);
  
  expect(mockCallback).toHaveBeenCalledTimes(3);
});
```

### Testing Promise Chains

```typescript
test('waits for promise chain completion', async () => {
  const result = await Promise.resolve('initial')
    .then(value => {
      return new Promise(resolve => {
        setTimeout(() => resolve(`${value}-processed`), 50);
      });
    });
  
  // Additional wait if needed
  await waitFor(10);
  
  expect(result).toBe('initial-processed');
});
```

## See Also

- [Testing Patterns](../guides/testing-patterns.md) - Learn about async testing patterns
- [Common Issues](../guides/common-issues.md) - Troubleshooting async tests
- [Mock Utilities](mock-utilities.md) - Creating mocks for async functions