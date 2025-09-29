# LoggerService Features

## Purpose
Centralized logging service with environment-aware output and structured formatting.

## Key Capabilities
- **Multiple Levels**: INFO, ERROR, WARN, DEBUG
- **Environment-Aware**: DEBUG only in development
- **Structured Output**: Consistent timestamp format
- **Dependency Injectable**: Interface-based design

## Usage
```typescript
const logger = new LoggerService();

logger.info('Application started');
logger.error('Database failed', error);
logger.warn('High memory usage');
logger.debug('Request details', { userId: 123 }); // Only in development
```

## Dependency Injection
```typescript
class UserService {
  constructor(private readonly logger: ILoggerService) {}
  
  async getUser(id: string): Promise<User> {
    this.logger.info('Fetching user', { userId: id });
    // business logic
  }
}
```

## Output Format
```
[INFO] 2025-06-12T10:07:58.186Z: Application started
[ERROR] 2025-06-12T10:07:58.187Z: Database failed Error: Connection timeout
[DEBUG] 2025-06-12T10:07:58.189Z: Request details { userId: 123 }
```

## Expected Behavior
- ✅ All logs include ISO timestamps
- ✅ DEBUG logs suppressed in production
- ✅ Supports additional context data
- ✅ Easy to mock for testing
