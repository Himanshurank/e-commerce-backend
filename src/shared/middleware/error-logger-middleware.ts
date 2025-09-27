import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

interface ErrorRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Simple error logging middleware - catches all errors automatically
 */
export const errorLogger = (
  error: Error,
  req: ErrorRequest,
  res: Response,
  next: NextFunction
): void => {
  // Log error to Sentry with full context
  Sentry.logger.error(`Unhandled Error: ${error.message}`, {
    action: "unhandled_error",
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    url: req.url,
    query: req.query,
    body: req.body,
    userId: req.user?.userId,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Also capture exception for Sentry dashboard
  Sentry.captureException(error, {
    tags: {
      endpoint: req.path,
      method: req.method,
      user_id: req.user?.userId?.toString(),
    },
    extra: {
      query: req.query,
      body: req.body,
      headers: req.headers,
    },
  });

  // Send error response
  const statusCode = error.name === "ValidationError" ? 400 : 500;

  res.status(statusCode).json({
    success: false,
    message: error.message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async error wrapper - use this to wrap async route handlers
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      // Log async errors
      Sentry.logger.error(`Async Error in ${req.method} ${req.path}`, {
        action: "async_error",
        error: error.message,
        stack: error.stack,
        method: req.method,
        path: req.path,
        userId: (req as any).user?.userId,
      });

      next(error);
    });
  };
};

/**
 * Simple try-catch wrapper for any function
 */
export const withErrorLogging = async <T>(
  operation: () => Promise<T>,
  context: {
    action: string;
    userId?: number;
    [key: string]: any;
  }
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    Sentry.logger.error(`Operation failed: ${context.action}`, {
      ...context,
      action: `${context.action}_error`,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
};
