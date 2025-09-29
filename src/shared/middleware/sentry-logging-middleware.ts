import { Request, Response, NextFunction } from "express";
import { LoggerFactory } from "../factories/logger-factory";

// Import the authenticated request type
interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
}

export interface SentryRequest extends Request {
  startTime?: number;
  user?: AuthenticatedUser;
}

/**
 * Middleware to log all API calls using LoggerService
 */
export const sentryApiLogger = (
  req: SentryRequest,
  res: Response,
  next: NextFunction
): void => {
  const logger = LoggerFactory.getInstance();

  // Record start time
  req.startTime = Date.now();

  // Log API call start using our logger service
  logger.logApiOperation("started", req.method, req.path, req.user?.userId, {
    url: req.url,
    query: req.query,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  // Listen for response finish to log completion
  res.on("finish", () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const statusCode = res.statusCode;

    // Log API call completion
    if (statusCode >= 400) {
      logger.error(
        `API Call Failed: ${req.method} ${req.path}`,
        new Error(`HTTP ${statusCode}`),
        {
          action: "api_call_error",
          method: req.method,
          path: req.path,
          statusCode,
          duration: `${duration}ms`,
          userId: req.user?.userId,
          query: req.query,
          body: req.body,
        }
      );
    } else {
      logger.info(
        `API Call Success: ${req.method} ${req.path} (${duration}ms)`,
        {
          action: "api_call_success",
          method: req.method,
          path: req.path,
          statusCode,
          duration: `${duration}ms`,
          userId: req.user?.userId,
        }
      );
    }

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      logger.warn(
        `Slow API Request: ${req.method} ${req.path} took ${duration}ms`,
        {
          action: "slow_request",
          method: req.method,
          path: req.path,
          duration: `${duration}ms`,
          userId: req.user?.userId,
        }
      );
    }
  });

  next();
};

/**
 * Middleware to capture business events using LoggerService
 */
export const sentryBusinessLogger = (eventType: string) => {
  return (req: SentryRequest, res: Response, next: NextFunction): void => {
    const logger = LoggerFactory.getInstance();

    // Log business event using our logger service
    logger.logBusinessEvent(eventType, {
      user_id: req.user?.userId,
      endpoint: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    next();
  };
};

/**
 * Middleware to log database operations using LoggerService
 */
export const sentryDatabaseLogger = (operation: string) => {
  return (req: SentryRequest, res: Response, next: NextFunction): void => {
    const logger = LoggerFactory.getInstance();

    // Log database operation using our logger service
    logger.info(`Database Operation: ${operation}`, {
      operation,
      endpoint: req.path,
      method: req.method,
      user_id: req.user?.userId,
    });

    next();
  };
};
