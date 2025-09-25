# Project Best Practices

## Common Best Practices

### Code Style & Documentation

- Use TypeScript strict mode
- Document public interfaces and complex functions with JSDoc
- Keep functions small and focused (max 20-30 lines)
- Use meaningful variable/function names (no abbreviations)
- Document complex business logic with inline comments
- Use prettier for consistent formatting
- Follow conventional commits (feat:, fix:, chore:, etc.)

### Error Handling

- Use custom error classes for domain-specific errors
- Always include error context in error messages
- Log errors with appropriate severity levels
- Handle async errors with try/catch
- Provide user-friendly error messages in UI

### Performance

- Memoize expensive computations
- Use React.memo for pure components
- Implement proper cleanup in useEffect
- Lazy load routes and heavy components
- Use proper keys in lists
- Debounce frequent events

### Security

- Never store sensitive data in localStorage
- Sanitize user inputs
- Use environment variables for secrets
- Implement proper CORS policies
- Use HTTPS for all API calls
- Validate all API responses

## Layer-Specific Best Practices

### Domain Layer

- Keep entities immutable
- Use value objects for complex attributes
- Implement validation in constructors
- Use factory methods for complex object creation
- Keep business rules in domain objects
- Document invariants and constraints

Example:

```typescript
class UserEntity {
  // Document complex business rules
  /**
   * Password must be:
   * - At least 8 characters
   * - Contain 1 uppercase, 1 lowercase, 1 number
   * - No common patterns (validated by zxcvbn)
   */
  private validatePassword(password: string): void {
    // Implementation
  }
}
```

### Application Layer

- Use interfaces for dependencies
- Implement command/query separation
- Keep services stateless
- Use DTOs for data transfer
- Document service methods
- Handle all possible error cases

Example:

```typescript
interface AuthService {
  /**
   * Authenticates user and returns session token
   * @throws {InvalidCredentialsError} When credentials are invalid
   * @throws {AccountLockedError} When account is locked
   */
  login(credentials: LoginDTO): Promise<SessionToken>;
}
```

### Infrastructure Layer

- Implement retry logic for external calls
- Cache expensive operations
- Use dependency injection
- Implement proper logging
- Handle network errors gracefully
- Document API endpoints

Example:

```typescript
class AuthRepository implements IAuthRepository {
  // Document implementation details
  /**
   * Implements exponential backoff retry strategy
   * Max retries: 3
   * Initial delay: 1s
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    // Implementation
  }
}
```

### Presentation Layer

- Use atomic design principles
- Keep components pure when possible
- Implement proper loading states
- Handle error boundaries
- Use proper prop types
- Document component props

Example:

```typescript
interface ButtonProps {
  /** Called when button is clicked */
  onClick: () => void;
  /** Visual variant of the button */
  variant: "primary" | "secondary";
  /** Whether button is in loading state */
  isLoading?: boolean;
}
```

## Testing Best Practices

### Unit Tests

- Test one thing per test
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error scenarios
- Keep tests independent

Example:

```typescript
describe("UserEntity", () => {
  it("should throw InvalidPasswordError when password is too weak", () => {
    // Arrange
    const weakPassword = "password123";

    // Act & Assert
    expect(() => new UserEntity({ password: weakPassword })).toThrow(
      InvalidPasswordError
    );
  });
});
```

### Integration Tests

- Test complete features
- Use test databases
- Clean up after tests
- Mock external services
- Test happy and error paths
- Document test scenarios

Example:

```typescript
describe("AuthService Integration", () => {
  beforeEach(() => setupTestDb());
  afterEach(() => cleanupTestDb());

  it("should complete login flow with valid credentials", async () => {
    // Test implementation
  });
});
```

### E2E Tests

- Test critical user flows
- Use realistic test data
- Test on multiple browsers
- Include visual regression
- Document test scenarios
- Use page objects

Example:

```typescript
describe("Login Flow", () => {
  it("should login and redirect to dashboard", async () => {
    const loginPage = new LoginPage();
    await loginPage.login(validCredentials);
    await expect(page).toHaveURL("/dashboard");
  });
});
```
