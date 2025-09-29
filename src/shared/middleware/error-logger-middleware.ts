import { Request, Response, NextFunction } from "express";
import { LoggerFactory } from "../factories/logger-factory";

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
  const logger = LoggerFactory.getInstance();

  // Log error with full context using our logger service
  logger.error(`Unhandled Error: ${error.message}`, error, {
    action: "unhandled_error",
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
      const logger = LoggerFactory.getInstance();

      // Log async errors using our logger service
      logger.error(`Async Error in ${req.method} ${req.path}`, error, {
        action: "async_error",
        method: req.method,
        path: req.path,
        userId: (req as any).user?.userId,
      });

      next(error);
    });
  };
};

/**
 * Simple try-catch wrapper for any function using LoggerService
 */
export const withErrorLogging = async <T>(
  operation: () => Promise<T>,
  context: {
    action: string;
    userId?: number;
    [key: string]: any;
  }
): Promise<T> => {
  const logger = LoggerFactory.getInstance();

  try {
    return await operation();
  } catch (error) {
    logger.error(`Operation failed: ${context.action}`, error as Error, {
      ...context,
      action: `${context.action}_error`,
    });
    throw error;
  }
};
