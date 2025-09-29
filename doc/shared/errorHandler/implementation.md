# ErrorHandler Implementation

## Interface

```typescript
// src/shared/core/interfaces/services/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export interface IErrorHandler {
  handleError(error: Error, req: Request, res: Response, next: NextFunction): void;
}
```

## Type

```typescript
// src/shared/core/types/services/errorHandler.ts
export type TErrorResponse = {
  success: boolean;
  message: string;
  error?: string;
  statusCode: number;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  validationType?: string;
};
```

## Implementation

```typescript
// src/shared/services/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { IErrorHandler } from "../core/interfaces/services/errorHandler";
import { TErrorResponse } from "../core/types/services/errorHandler";
import { ILoggerService } from "../core/interfaces/services/loggerService";
import { HTTP_STATUS_CODES, API_MESSAGES } from "../constants/constants";

export class ErrorHandler implements IErrorHandler {
  private static readonly STATUS_MAP: Record<string, number> = {
    ValidationError: HTTP_STATUS_CODES.BAD_REQUEST,
    BusinessRuleError: HTTP_STATUS_CODES.BAD_REQUEST,
    UnauthorizedError: HTTP_STATUS_CODES.UNAUTHORIZED,
    ForbiddenError: HTTP_STATUS_CODES.FORBIDDEN,
    NotFoundError: HTTP_STATUS_CODES.NOT_FOUND,
    ConflictError: HTTP_STATUS_CODES.CONFLICT,
  };

  private static readonly MESSAGE_MAP: Record<string, string> = {
    ValidationError: API_MESSAGES.VALIDATION_ERROR,
    NotFoundError: API_MESSAGES.NOT_FOUND,
    UnauthorizedError: API_MESSAGES.UNAUTHORIZED,
    ForbiddenError: API_MESSAGES.FORBIDDEN,
  };

  constructor(private readonly logger: ILoggerService) {}

  public handleError(error: any, req: Request, res: Response, next: NextFunction): void {
    this.logger.error("Unhandled error occurred:", error);

    const isJoi = error?.error?.isJoi || error?.isJoi;
    const statusCode = isJoi
      ? HTTP_STATUS_CODES.BAD_REQUEST
      : ErrorHandler.STATUS_MAP[error.name] || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

    const message = this.getErrorMessage(error, isJoi);
    const response: TErrorResponse = {
      success: false,
      message,
      statusCode,
    };

    if (process.env.NODE_ENV === "development") {
      response.error = error.stack;
    }

    if (isJoi) {
      this.addJoiDetails(response, error);
    } else if (
      error.details &&
      (error.name === "BusinessRuleError" || error.name === "ValidationError")
    ) {
      response.errors = error.details;
    }

    res.status(statusCode).json(response);
  }

  private getErrorMessage(error: any, isJoi: boolean): string {
    if (isJoi) {
      const validationType = error.type || "request";
      return `Validation failed for ${validationType}`;
    }

    if (error.message?.includes("database")) return "Database operation failed";
    if (error.message?.includes("connection")) return "Database connection failed";

    if (process.env.NODE_ENV === "production" && error.name === "InternalServerError") {
      return "Internal Server Error";
    }

    return error.message || ErrorHandler.MESSAGE_MAP[error.name] || API_MESSAGES.INTERNAL_ERROR;
  }

  private addJoiDetails(response: TErrorResponse, error: any): void {
    const joiError = error.error || error;

    if (joiError.details) {
      response.errors = joiError.details.map((detail: any) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      if (error.type && process.env.NODE_ENV === "development") {
        response.validationType = error.type;
      }
    }
  }
}
```

## Key Features

- **Dual Static Maps**: STATUS_MAP and MESSAGE_MAP for centralized error handling
- **Joi Validation Support**: Complete Joi error processing with field mapping
- **Database Error Detection**: Specific handling for database-related errors
- **Environment-Aware**: Stack traces and validation types only in development
- **Business Rule Integration**: Support for custom business rule validation errors

## Architecture

- **Layer**: Shared Infrastructure Service
- **Dependencies**: ILoggerService, HTTP_STATUS_CODES, API_MESSAGES
- **Usage**: Express global error middleware (must be last)

## Integration

```typescript
// Server initialization
private initializeErrorHandling(): void {
  this.app.use(this.errorHandler.handleError.bind(this.errorHandler));
}
```

## Testing Mock

```typescript
const mockErrorHandler: IErrorHandler = {
  handleError: (error, req, res, next) => {
    res.status(500).json({
      success: false,
      message: error.message,
      statusCode: 500,
    });
  },
  handleAsyncError: fn => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  },
};
```
