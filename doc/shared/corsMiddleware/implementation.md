# CORS Middleware Implementation

## Interface
```typescript
// src/shared/core/interfaces/middleware/corsMiddleware.ts
export interface ICorsMiddleware {
  getCorsMiddleware(): any;
}
```

## Type
```typescript
// src/shared/core/types/middleware/corsMiddleware.ts
export type TCorsConfig = {
  origin: string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
};
```

## Implementation
```typescript
// src/shared/middleware/corsMiddleware.ts
import cors from 'cors';
import { ICorsMiddleware } from '../core/interfaces/middleware/corsMiddleware';
import { TCorsConfig } from '../core/types/middleware/corsMiddleware';

export class CorsMiddleware implements ICorsMiddleware {
  private corsConfig: TCorsConfig;

  constructor() {
    this.corsConfig = {
      origin: this.getOriginValidator(),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
      ],
      credentials: true,
      maxAge: 86400 // 24 hours
    };
  }

  public getCorsMiddleware() {
    return cors(this.corsConfig);
  }

  private getOriginValidator() {
    const allowedOrigins = this.getAllowedOrigins();
    
    return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
      }
    };
  }

  private getAllowedOrigins(): string[] {
    if (process.env.NODE_ENV === 'production') {
      return [
        'https://app.agentclarity.com',
        'https://admin.agentclarity.com'
      ];
    }

    // Development origins
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
  }
}
```

## Key Patterns
- **Environment-Based Configuration**: Different origins for dev/prod
- **Origin Callback Validation**: Dynamic origin checking with error handling
- **Null Origin Handling**: Allow requests without origin (mobile, tools)
- **Static Configuration**: Pre-defined headers and methods

## Dependencies
- `cors` middleware package for Express

## Integration
```typescript
// Server setup
class Server {
  private corsMiddleware: ICorsMiddleware;
  
  constructor() {
    this.corsMiddleware = new CorsMiddleware();
  }
  
  private initializeMiddleware(): void {
    // Apply CORS globally
    this.app.use(this.corsMiddleware.getCorsMiddleware());
  }
}

// Route-specific CORS
app.get('/api/public', 
  corsMiddleware.getCorsMiddleware(),
  (req, res) => {
    res.json({ data: 'public' });
  }
);

// Environment variables
// NODE_ENV=production (for production origins)
// NODE_ENV=development (for localhost origins)
```

## Testing Mock
```typescript
const mockCorsMiddleware: ICorsMiddleware = {
  getCorsMiddleware() {
    return (req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
      next();
    };
  }
};
```

## Architecture
- **Layer**: Shared Infrastructure Middleware
- **Dependencies**: Express CORS package
- **Usage**: HTTP middleware for cross-origin requests
