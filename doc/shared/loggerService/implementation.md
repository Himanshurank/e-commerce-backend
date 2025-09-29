# LoggerService Implementation

## Interface

```typescript
// src/shared/core/interfaces/services/loggerService.ts
export interface ILoggerService {
  info(message: string, ...args: any[]): void;
  error(message: string, error?: Error | any): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}
```

## Implementation

```typescript
// src/shared/services/loggerService.ts
import { ILoggerService } from "../core/interfaces/services/loggerService";

export class LoggerService implements ILoggerService {
  public info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
  }

  public error(message: string, error?: Error | any): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
    }
  }
}
```

## Key Features

- **Environment-Aware DEBUG**: Only logs debug messages in development
- **ISO Timestamps**: Consistent timestamp format across all log levels
- **Variadic Arguments**: Supports additional context data via spread operator
- **No External Dependencies**: Uses only Node.js built-in console methods

## Architecture

- **Layer**: Shared Infrastructure Service
- **Dependencies**: None (leaf dependency)
- **Usage**: Injected into all services via constructor

## Integration

```typescript
// Dependency injection pattern
constructor(private readonly logger: ILoggerService) {}

// Usage examples
this.logger.info("Processing request", { userId: 123 });
this.logger.error("Database failed", error);
```

## Testing Mock

```typescript
const mockLogger: ILoggerService = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};
```
