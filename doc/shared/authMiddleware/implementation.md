---
description:
globs:
alwaysApply: false
---
# AuthMiddleware Implementation

## Interface
```typescript
// src/shared/core/interfaces/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export interface IAuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface IAuthMiddleware {
  authenticate: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
  authorize: (roles: string[]) => (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
}
```

## Implementation
```typescript
// src/shared/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { IAuthMiddleware, IAuthenticatedRequest } from '../core/interfaces/middlewares/authMiddleware';
import { ILoggerService } from '../core/interfaces/services/loggerService';

export class AuthMiddleware implements IAuthMiddleware {
  constructor(private readonly logger: ILoggerService) {}

  public authenticate = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access token is required',
          statusCode: 401
        });
        return;
      }

      const token = authHeader.substring(7);
      
      // TODO: Implement JWT verification logic here
      this.logger.debug('Authentication middleware - token received:', token);
      
      // Mock user for development
      req.user = {
        id: '1',
        email: 'user@example.com',
        role: 'user'
      };

      next();
    } catch (error) {
      this.logger.error('Authentication error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid access token',
        statusCode: 401
      });
    }
  };

  public authorize = (roles: string[]) => {
    return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          statusCode: 401
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          statusCode: 403
        });
        return;
      }

      next();
    };
  };
}
```

## Key Patterns
- **Arrow Function Methods**: Maintains `this` context for Express middleware
- **Token Extraction**: `authHeader.substring(7)` removes "Bearer " prefix
- **Higher-Order Function**: `authorize()` returns configured middleware
- **Request Augmentation**: Adds `user` property to request object

## Dependencies
- `ILoggerService` for authentication logging
- `express` types for middleware integration

## Production JWT Implementation
```typescript
import jwt from 'jsonwebtoken';

// Replace mock authentication with:
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
req.user = {
  id: decoded.sub || decoded.userId,
  email: decoded.email,
  role: decoded.role || 'user'
};
```

## Integration
```typescript
// Server setup
class Server {
  private authMiddleware: IAuthMiddleware;
  
  constructor() {
    const logger = new LoggerService();
    this.authMiddleware = new AuthMiddleware(logger);
  }
}

// Route protection
app.get('/protected', 
  authMiddleware.authenticate,
  protectedController.getData
);

// Multiple roles
app.get('/dashboard',
  authMiddleware.authenticate,
  authMiddleware.authorize(['admin', 'manager']),
  dashboardController.getData
);
```

## Testing Mock
```typescript
const mockAuthMiddleware: IAuthMiddleware = {
  authenticate: (req, res, next) => {
    req.user = { id: '1', email: 'test@example.com', role: 'user' };
    next();
  },
  authorize: (roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  }
};
```

## Architecture
- **Layer**: Shared Infrastructure Middleware
- **Dependencies**: ILoggerService
- **Usage**: Express route protection and authorization
