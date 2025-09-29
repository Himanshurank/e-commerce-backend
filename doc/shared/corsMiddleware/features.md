# CORS Middleware Features

## Purpose
Environment-aware CORS configuration middleware for Express applications with flexible origin control and preflight handling.

## Key Capabilities
- **Environment-Based Origins**: Different allowed origins for development vs production
- **Dynamic Origin Validation**: Function-based origin checking
- **Preflight Request Handling**: Automatic OPTIONS request processing
- **Credential Support**: Configurable credential inclusion for cross-origin requests

## Usage
```typescript
const corsMiddleware = new CorsMiddleware();

// Apply to all routes
app.use(corsMiddleware.getCorsMiddleware());

// API with CORS protection
app.get('/api/users', corsMiddleware.getCorsMiddleware(), (req, res) => {
  res.json({ users: [] });
});

// Production configuration
// Set NODE_ENV=production for restricted origins
```

## Environment Behavior
```typescript
// Development (NODE_ENV !== 'production')
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000'
];

// Production (NODE_ENV === 'production')
const allowedOrigins = [
  'https://app.agentclarity.com',
  'https://admin.agentclarity.com'
];
```

## CORS Headers
```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## Origin Validation
- ✅ **Development**: Localhost origins (3000, 3001) + 127.0.0.1
- ✅ **Production**: Whitelist of specific production domains
- ❌ **Rejected**: Origins not in allowedOrigins array
- ✅ **OPTIONS**: Preflight requests automatically handled

## Expected Behavior
- ✅ Environment-based origin control
- ✅ Dynamic origin validation with callback
- ✅ Automatic preflight request handling
- ✅ Credential support for authenticated requests
- ✅ Proper error handling for invalid origins
