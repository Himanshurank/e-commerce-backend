# AuthMiddleware Features

## Purpose
JWT-based authentication and authorization middleware for Express routes with role-based permissions.

## Key Capabilities
- **JWT Authentication**: Bearer token validation
- **Role-Based Authorization**: Permission checking by user roles
- **Request Augmentation**: Adds user context to request object
- **Express Integration**: Seamless middleware chain support

## Usage
```typescript
const logger = new LoggerService();
const authMiddleware = new AuthMiddleware(logger);

// Basic authentication
app.get('/profile', 
  authMiddleware.authenticate,
  (req: IAuthenticatedRequest, res) => {
    res.json({ user: req.user });
  }
);

// Role-based authorization
app.delete('/admin/users/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize(['admin']),
  adminController.deleteUser
);
```

## Request Type
```typescript
interface IAuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
```

## Authentication Flow
1. **Extract Token**: `Authorization: Bearer <token>`
2. **Validate JWT**: Verify token signature and expiry
3. **Populate User**: Add user data to `req.user`
4. **Continue**: Call `next()` middleware

## Error Responses
```json
// Missing token (401)
{ "success": false, "message": "Access token is required", "statusCode": 401 }

// Invalid token (401) 
{ "success": false, "message": "Invalid access token", "statusCode": 401 }

// Insufficient permissions (403)
{ "success": false, "message": "Insufficient permissions", "statusCode": 403 }
```

## Expected Behavior
- ✅ Validates Bearer token format
- ✅ Populates req.user with authenticated user data
- ✅ Supports multiple roles per endpoint
- ✅ Returns proper HTTP status codes
- ✅ Logs authentication attempts
