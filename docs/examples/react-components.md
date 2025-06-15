# React Components Testing Examples

This guide provides comprehensive examples of testing React components using `@rageltd/bun-test-utils` with various testing scenarios and patterns.

## Setup

All examples assume the following basic setup:

```typescript
import { 
  createModuleMocker, 
  createMockHook, 
  createMockComponent,
  setupTestCleanup,
  waitFor,
  createMock 
} from '@rageltd/bun-test-utils';
import { render, screen, fireEvent, waitFor as waitForElement } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterAll } from 'bun:test';

// Global cleanup setup
setupTestCleanup();
const mockModules = createModuleMocker();
```

## Basic Component Testing

### Simple Component with Props

```typescript
// Component: Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled = false, variant = 'primary' }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`btn btn-${variant}`}
    data-testid="button"
  >
    {children}
  </button>
);

// Test: Button.test.tsx
describe('Button Component', () => {
  const mockOnClick = createMock();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders children correctly', () => {
    render(<Button onClick={mockOnClick}>Click me</Button>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<Button onClick={mockOnClick}>Click me</Button>);
    
    fireEvent.click(screen.getByTestId('button'));
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    render(<Button onClick={mockOnClick} disabled>Click me</Button>);
    
    fireEvent.click(screen.getByTestId('button'));
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies correct variant class', () => {
    render(<Button onClick={mockOnClick} variant="secondary">Click me</Button>);
    
    expect(screen.getByTestId('button')).toHaveClass('btn-secondary');
  });
});
```

## Components with Hooks

### Component Using Custom Hooks

```typescript
// Component: UserProfile.tsx
const UserProfile: React.FC = () => {
  const { user, loading, error, updateProfile } = useUserProfile();

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error.message}</div>;
  if (!user) return <div data-testid="no-user">No user found</div>;

  return (
    <div data-testid="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => updateProfile({ name: 'Updated Name' })}>
        Update Profile
      </button>
    </div>
  );
};

// Test: UserProfile.test.tsx
describe('UserProfile Component', () => {
  afterAll(() => {
    mockModules.restoreAll();
  });

  describe('loading state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useUserProfile', () => ({
        useUserProfile: createMockHook('useUserProfile', {
          user: null,
          loading: true,
          error: null,
          updateProfile: createMock()
        })
      }));
    });

    it('shows loading indicator', () => {
      render(<UserProfile />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useUserProfile', () => ({
        useUserProfile: createMockHook('useUserProfile', {
          user: null,
          loading: false,
          error: new Error('Failed to load user'),
          updateProfile: createMock()
        })
      }));
    });

    it('shows error message', () => {
      render(<UserProfile />);
      
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to load user')).toBeInTheDocument();
    });
  });

  describe('no user state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useUserProfile', () => ({
        useUserProfile: createMockHook('useUserProfile', {
          user: null,
          loading: false,
          error: null,
          updateProfile: createMock()
        })
      }));
    });

    it('shows no user message', () => {
      render(<UserProfile />);
      
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
      expect(screen.getByText('No user found')).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    const mockUpdateProfile = createMock();

    beforeEach(async () => {
      await mockModules.mock('@/hooks/useUserProfile', () => ({
        useUserProfile: createMockHook('useUserProfile', {
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com'
          },
          loading: false,
          error: null,
          updateProfile: mockUpdateProfile
        })
      }));
    });

    it('renders user information', () => {
      render(<UserProfile />);
      
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('calls updateProfile when button is clicked', () => {
      render(<UserProfile />);
      
      fireEvent.click(screen.getByText('Update Profile'));
      
      expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'Updated Name' });
    });
  });
});
```

## Form Components

### Form with Validation

```typescript
// Component: LoginForm.tsx
const LoginForm: React.FC = () => {
  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: any = {};
      if (!values.email) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    }
  });

  const { login } = useAuth();

  const onSubmit = async (values: any) => {
    try {
      await login(values);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form">
      <div>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          placeholder="Email"
          data-testid="email-input"
        />
        {errors.email && <span data-testid="email-error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          placeholder="Password"
          data-testid="password-input"
        />
        {errors.password && <span data-testid="password-error">{errors.password}</span>}
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        data-testid="submit-button"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Test: LoginForm.test.tsx
describe('LoginForm Component', () => {
  const mockLogin = createMock();
  const mockHandleChange = createMock();
  const mockHandleSubmit = createMock();

  afterAll(() => {
    mockModules.restoreAll();
  });

  describe('initial state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks', () => ({
        useForm: createMockHook('useForm', {
          values: { email: '', password: '' },
          errors: {},
          handleChange: mockHandleChange,
          handleSubmit: mockHandleSubmit,
          isSubmitting: false
        }),
        useAuth: createMockHook('useAuth', {
          login: mockLogin
        })
      }));
    });

    it('renders form elements', () => {
      render(<LoginForm />);
      
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('has empty initial values', () => {
      render(<LoginForm />);
      
      expect(screen.getByTestId('email-input')).toHaveValue('');
      expect(screen.getByTestId('password-input')).toHaveValue('');
    });

    it('submit button is enabled', () => {
      render(<LoginForm />);
      
      expect(screen.getByTestId('submit-button')).not.toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Login');
    });
  });

  describe('validation errors', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks', () => ({
        useForm: createMockHook('useForm', {
          values: { email: '', password: '' },
          errors: { 
            email: 'Email is required',
            password: 'Password is required'
          },
          handleChange: mockHandleChange,
          handleSubmit: mockHandleSubmit,
          isSubmitting: false
        }),
        useAuth: createMockHook('useAuth', {
          login: mockLogin
        })
      }));
    });

    it('displays validation errors', () => {
      render(<LoginForm />);
      
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    });
  });

  describe('submitting state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks', () => ({
        useForm: createMockHook('useForm', {
          values: { email: 'test@example.com', password: 'password123' },
          errors: {},
          handleChange: mockHandleChange,
          handleSubmit: mockHandleSubmit,
          isSubmitting: true
        }),
        useAuth: createMockHook('useAuth', {
          login: mockLogin
        })
      }));
    });

    it('disables submit button and shows loading text', () => {
      render(<LoginForm />);
      
      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Logging in...');
    });
  });

  describe('form interactions', () => {
    beforeEach(async () => {
      mockHandleChange.mockClear();
      mockHandleSubmit.mockClear();

      await mockModules.mock('@/hooks', () => ({
        useForm: createMockHook('useForm', {
          values: { email: 'test@example.com', password: 'password123' },
          errors: {},
          handleChange: mockHandleChange,
          handleSubmit: mockHandleSubmit,
          isSubmitting: false
        }),
        useAuth: createMockHook('useAuth', {
          login: mockLogin
        })
      }));
    });

    it('calls handleChange when input values change', () => {
      render(<LoginForm />);
      
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'new@example.com' }
      });
      
      expect(mockHandleChange).toHaveBeenCalled();
    });

    it('calls handleSubmit when form is submitted', () => {
      render(<LoginForm />);
      
      fireEvent.submit(screen.getByTestId('login-form'));
      
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });
});
```

## Components with Context

### Component Using Context

```typescript
// Component: ThemeButton.tsx
const ThemeButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className={`theme-button theme-button--${theme}`}
      data-testid="theme-button"
    >
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
};

// Test: ThemeButton.test.tsx
describe('ThemeButton Component', () => {
  const mockToggleTheme = createMock();

  afterAll(() => {
    mockModules.restoreAll();
  });

  describe('light theme', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useTheme', () => ({
        useTheme: createMockHook('useTheme', {
          theme: 'light',
          toggleTheme: mockToggleTheme
        })
      }));
    });

    it('renders light theme button', () => {
      render(<ThemeButton />);
      
      expect(screen.getByTestId('theme-button')).toHaveClass('theme-button--light');
      expect(screen.getByText('Switch to dark mode')).toBeInTheDocument();
    });

    it('calls toggleTheme when clicked', () => {
      render(<ThemeButton />);
      
      fireEvent.click(screen.getByTestId('theme-button'));
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('dark theme', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useTheme', () => ({
        useTheme: createMockHook('useTheme', {
          theme: 'dark',
          toggleTheme: mockToggleTheme
        })
      }));
    });

    it('renders dark theme button', () => {
      render(<ThemeButton />);
      
      expect(screen.getByTestId('theme-button')).toHaveClass('theme-button--dark');
      expect(screen.getByText('Switch to light mode')).toBeInTheDocument();
    });
  });
});
```

## Async Components

### Component with Async Data Loading

```typescript
// Component: UserList.tsx
const UserList: React.FC = () => {
  const { users, loading, error, refetch } = useUsers();

  if (loading) return <div data-testid="loading">Loading users...</div>;
  if (error) return (
    <div data-testid="error">
      <p>Failed to load users: {error.message}</p>
      <button onClick={refetch} data-testid="retry-button">Retry</button>
    </div>
  );

  return (
    <div data-testid="user-list">
      <h2>Users ({users.length})</h2>
      {users.length === 0 ? (
        <p data-testid="empty-state">No users found</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id} data-testid={`user-${user.id}`}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      )}
      <button onClick={refetch} data-testid="refresh-button">
        Refresh
      </button>
    </div>
  );
};

// Test: UserList.test.tsx
describe('UserList Component', () => {
  const mockRefetch = createMock();

  afterAll(() => {
    mockModules.restoreAll();
  });

  describe('loading state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useUsers', () => ({
        useUsers: createMockHook('useUsers', {
          users: [],
          loading: true,
          error: null,
          refetch: mockRefetch
        })
      }));
    });

    it('shows loading indicator', () => {
      render(<UserList />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    beforeEach(async () => {
      mockRefetch.mockClear();
      
      await mockModules.mock('@/hooks/useUsers', () => ({
        useUsers: createMockHook('useUsers', {
          users: [],
          loading: false,
          error: new Error('Network error'),
          refetch: mockRefetch
        })
      }));
    });

    it('shows error message with retry button', () => {
      render(<UserList />);
      
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load users: Network error')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('calls refetch when retry button is clicked', () => {
      render(<UserList />);
      
      fireEvent.click(screen.getByTestId('retry-button'));
      
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    beforeEach(async () => {
      await mockModules.mock('@/hooks/useUsers', () => ({
        useUsers: createMockHook('useUsers', {
          users: [],
          loading: false,
          error: null,
          refetch: mockRefetch
        })
      }));
    });

    it('shows empty state message', () => {
      render(<UserList />);
      
      expect(screen.getByTestId('user-list')).toBeInTheDocument();
      expect(screen.getByText('Users (0)')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('shows refresh button', () => {
      render(<UserList />);
      
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });
  });

  describe('success state with users', () => {
    const mockUsers = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
      { id: 3, name: 'Charlie', email: 'charlie@example.com' }
    ];

    beforeEach(async () => {
      mockRefetch.mockClear();
      
      await mockModules.mock('@/hooks/useUsers', () => ({
        useUsers: createMockHook('useUsers', {
          users: mockUsers,
          loading: false,
          error: null,
          refetch: mockRefetch
        })
      }));
    });

    it('renders user list with correct count', () => {
      render(<UserList />);
      
      expect(screen.getByTestId('user-list')).toBeInTheDocument();
      expect(screen.getByText('Users (3)')).toBeInTheDocument();
    });

    it('renders all users', () => {
      render(<UserList />);
      
      expect(screen.getByTestId('user-1')).toHaveTextContent('Alice - alice@example.com');
      expect(screen.getByTestId('user-2')).toHaveTextContent('Bob - bob@example.com');
      expect(screen.getByTestId('user-3')).toHaveTextContent('Charlie - charlie@example.com');
    });

    it('does not show empty state', () => {
      render(<UserList />);
      
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('calls refetch when refresh button is clicked', () => {
      render(<UserList />);
      
      fireEvent.click(screen.getByTestId('refresh-button'));
      
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Component Integration Testing

### Parent-Child Component Integration

```typescript
// Components: TodoApp.tsx and TodoItem.tsx
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoItem: React.FC<{ todo: Todo; onToggle: (id: number) => void; onDelete: (id: number) => void }> = ({
  todo,
  onToggle,
  onDelete
}) => (
  <li data-testid={`todo-${todo.id}`} className={todo.completed ? 'completed' : ''}>
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo.id)}
      data-testid={`checkbox-${todo.id}`}
    />
    <span data-testid={`text-${todo.id}`}>{todo.text}</span>
    <button onClick={() => onDelete(todo.id)} data-testid={`delete-${todo.id}`}>
      Delete
    </button>
  </li>
);

const TodoApp: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [newTodoText, setNewTodoText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      addTodo(newTodoText.trim());
      setNewTodoText('');
    }
  };

  return (
    <div data-testid="todo-app">
      <form onSubmit={handleSubmit} data-testid="add-todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo"
          data-testid="new-todo-input"
        />
        <button type="submit" data-testid="add-todo-button">Add</button>
      </form>
      
      <ul data-testid="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

// Test: TodoApp.test.tsx
describe('TodoApp Integration', () => {
  const mockAddTodo = createMock();
  const mockToggleTodo = createMock();
  const mockDeleteTodo = createMock();

  const defaultTodos = [
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Write tests', completed: true },
    { id: 3, text: 'Deploy app', completed: false }
  ];

  beforeEach(async () => {
    mockAddTodo.mockClear();
    mockToggleTodo.mockClear();
    mockDeleteTodo.mockClear();

    await mockModules.mock('@/hooks/useTodos', () => ({
      useTodos: createMockHook('useTodos', {
        todos: defaultTodos,
        addTodo: mockAddTodo,
        toggleTodo: mockToggleTodo,
        deleteTodo: mockDeleteTodo
      })
    }));
  });

  afterAll(() => {
    mockModules.restoreAll();
  });

  it('renders todo app with form and list', () => {
    render(<TodoApp />);
    
    expect(screen.getByTestId('todo-app')).toBeInTheDocument();
    expect(screen.getByTestId('add-todo-form')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
  });

  it('renders all todos', () => {
    render(<TodoApp />);
    
    expect(screen.getByTestId('todo-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-2')).toBeInTheDocument();
    expect(screen.getByTestId('todo-3')).toBeInTheDocument();
    
    expect(screen.getByTestId('text-1')).toHaveTextContent('Learn React');
    expect(screen.getByTestId('text-2')).toHaveTextContent('Write tests');
    expect(screen.getByTestId('text-3')).toHaveTextContent('Deploy app');
  });

  it('shows completed state correctly', () => {
    render(<TodoApp />);
    
    expect(screen.getByTestId('checkbox-1')).not.toBeChecked();
    expect(screen.getByTestId('checkbox-2')).toBeChecked();
    expect(screen.getByTestId('checkbox-3')).not.toBeChecked();
    
    expect(screen.getByTestId('todo-2')).toHaveClass('completed');
  });

  it('adds new todo when form is submitted', () => {
    render(<TodoApp />);
    
    fireEvent.change(screen.getByTestId('new-todo-input'), {
      target: { value: 'New todo item' }
    });
    
    fireEvent.click(screen.getByTestId('add-todo-button'));
    
    expect(mockAddTodo).toHaveBeenCalledWith('New todo item');
  });

  it('does not add empty todo', () => {
    render(<TodoApp />);
    
    fireEvent.change(screen.getByTestId('new-todo-input'), {
      target: { value: '   ' }
    });
    
    fireEvent.click(screen.getByTestId('add-todo-button'));
    
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  it('toggles todo when checkbox is clicked', () => {
    render(<TodoApp />);
    
    fireEvent.click(screen.getByTestId('checkbox-1'));
    
    expect(mockToggleTodo).toHaveBeenCalledWith(1);
  });

  it('deletes todo when delete button is clicked', () => {
    render(<TodoApp />);
    
    fireEvent.click(screen.getByTestId('delete-2'));
    
    expect(mockDeleteTodo).toHaveBeenCalledWith(2);
  });

  it('clears input after adding todo', async () => {
    render(<TodoApp />);
    
    const input = screen.getByTestId('new-todo-input');
    
    fireEvent.change(input, { target: { value: 'New todo' } });
    expect(input).toHaveValue('New todo');
    
    fireEvent.click(screen.getByTestId('add-todo-button'));
    
    // Input should be cleared after submission
    await waitFor(10);
    expect(input).toHaveValue('');
  });
});
```

## Testing Best Practices Summary

### Key Takeaways

1. **Test Behavior, Not Implementation**: Focus on what the user sees and does
2. **Use Descriptive Test Names**: Make it clear what scenario you're testing
3. **Test All States**: Loading, error, empty, and success states
4. **Mock at Module Boundaries**: Mock hooks and services, not internal details
5. **Clean Up After Tests**: Always restore mocks to prevent test pollution
6. **Use Realistic Test Data**: Make your mocks represent real-world scenarios
7. **Test User Interactions**: Click, type, submit - test how users actually use your components

### Common Patterns Recap

- **State Testing**: Test different hook return values
- **Interaction Testing**: Test clicks, form submissions, input changes
- **Integration Testing**: Test multiple components working together
- **Async Testing**: Handle loading states and async operations
- **Error Testing**: Test error boundaries and error states
- **Accessibility Testing**: Use screen readers and keyboard navigation

Following these examples and patterns will help you create comprehensive, maintainable tests for your React components using `@rageltd/bun-test-utils`.