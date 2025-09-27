import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  type: string;
  timestamp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "MISSING_TOKEN",
        message: "Access token is required",
      },
    });
  }

  try {
    const jwtSecret = process.env["JWT_SECRET"] || "your-secret-key";
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Validate token structure
    if (
      !decoded.userId ||
      !decoded.email ||
      !decoded.role ||
      decoded.type !== "access_token"
    ) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid token structure",
        },
      });
    }

    // Add user information to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
      timestamp: decoded.timestamp,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Access token has expired",
        },
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid access token",
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: "TOKEN_VERIFICATION_ERROR",
        message: "Failed to verify token",
      },
    });
  }
};

// Middleware to check if user has specific role
export const requireRole = (requiredRoles: string | string[]) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: `Required role: ${roles.join(" or ")}. Current role: ${
            req.user.role
          }`,
        },
      });
    }

    return next();
  };
};

// Middleware for admin-only routes
export const requireAdmin = requireRole("ADMIN");

// Middleware for seller or admin routes
export const requireSellerOrAdmin = requireRole(["SELLER", "ADMIN"]);

// Middleware for customer routes (any authenticated user)
export const requireCustomer = requireRole(["CUSTOMER", "SELLER", "ADMIN"]);

// Optional authentication - doesn't fail if no token is provided
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // No token provided, continue without authentication
    return next();
  }

  try {
    const jwtSecret = process.env["JWT_SECRET"] || "your-secret-key";
    const decoded = jwt.verify(token, jwtSecret) as any;

    if (
      decoded.userId &&
      decoded.email &&
      decoded.role &&
      decoded.type === "access_token"
    ) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        type: decoded.type,
        timestamp: decoded.timestamp,
      };
    }
  } catch (error) {
    // Invalid token, but we don't fail - just continue without authentication
    console.warn("Invalid token in optional auth:", (error as Error).message);
  }

  return next();
};

// Middleware to check if user owns the resource
export const requireOwnership = (userIdParam: string = "userId") => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      });
    }

    const resourceUserId = req.params[userIdParam];

    // Admin can access any resource
    if (req.user.role === "ADMIN") {
      return next();
    }

    // User can only access their own resources
    if (req.user.userId !== resourceUserId) {
      return res.status(403).json({
        success: false,
        error: {
          code: "RESOURCE_ACCESS_DENIED",
          message: "You can only access your own resources",
        },
      });
    }

    return next();
  };
};

// Rate limiting middleware (basic implementation)
export const rateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || "unknown";
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }

    // Get or create request record
    const record = requests.get(identifier) || {
      count: 0,
      resetTime: now + options.windowMs,
    };

    // Check if within rate limit
    if (record.count >= options.maxRequests && record.resetTime > now) {
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message:
            options.message || "Too many requests. Please try again later.",
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
      });
    }

    // Reset counter if window has expired
    if (record.resetTime <= now) {
      record.count = 0;
      record.resetTime = now + options.windowMs;
    }

    // Increment counter
    record.count++;
    requests.set(identifier, record);

    return next();
  };
};
