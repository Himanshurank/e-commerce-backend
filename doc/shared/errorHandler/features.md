# ErrorHandler Features

## Purpose
Centralized error handling service for Express applications with automatic logging and consistent HTTP response formatting.

## Key Capabilities
- **Centralized Error Processing**: Single point for all application errors
- **HTTP Status Mapping**: Automatic status code assignment based on error type
- **Environment-Aware Details**: Full details in development, sanitized in production
- **Async Error Handling**: Promise wrapper for async route handlers

## Usage
```typescript
const logger = new LoggerService();
const errorHandler = new ErrorHandler(logger);

// Global error handler (last middleware)
app.use(errorHandler.handleError.bind(errorHandler));

// Async route wrapper
app.get('/users/:id', 
  errorHandler.handleAsyncError(async (req, res) => {
    const user = await userService.getUser(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json(user);
  })
);
```

## Error Type Mapping
```typescript
// Error names → HTTP status codes
ValidationError → 400 Bad Request
UnauthorizedError → 401 Unauthorized  
ForbiddenError → 403 Forbidden
NotFoundError → 404 Not Found
ConflictError → 409 Conflict
Default → 500 Internal Server Error
```

## Response Format
```json
// Development
{
  "success": false,
  "message": "User not found",
  "statusCode": 404,
  "error": "NotFoundError: User not found\n    at UserService.getUser..."
}

// Production
{
  "success": false,
  "message": "User not found", 
  "statusCode": 404
}
```

## Expected Behavior
- ✅ Logs all errors with context
- ✅ Maps error types to proper HTTP status codes
- ✅ Includes stack traces in development only
- ✅ Handles both sync and async errors
- ✅ Returns consistent error response format
