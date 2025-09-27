import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

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
 * Middleware to log all API calls to Sentry
 */
export const sentryApiLogger = (
  req: SentryRequest,
  res: Response,
  next: NextFunction
): void => {
  // Record start time
  req.startTime = Date.now();

  // Set user context if available
  if (req.user) {
    Sentry.setUser({
      id: req.user.userId?.toString(),
      email: req.user.email,
    });
  }

  // Set request context
  Sentry.setContext("request", {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: {
      "user-agent": req.get("User-Agent"),
      "content-type": req.get("Content-Type"),
      accept: req.get("Accept"),
    },
    ip: req.ip,
  });

  // Log API call start
  Sentry.logger.info(`API Call Started: ${req.method} ${req.path}`, {
    action: "api_call_start",
    method: req.method,
    path: req.path,
    url: req.url,
    query: req.query,
    userId: req.user?.userId,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  // Add breadcrumb for the request
  Sentry.addBreadcrumb({
    message: `API Call: ${req.method} ${req.path}`,
    category: "http.request",
    level: "info",
    data: {
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      user_id: req.user?.userId,
    },
  });

  // Start transaction for performance monitoring
  const transaction = Sentry.startSpan(
    {
      name: `${req.method} ${req.route?.path || req.path}`,
      op: "http.server",
    },
    () => {}
  );

  // Set tags
  Sentry.setTag("http.method", req.method);
  Sentry.setTag("http.route", req.route?.path || req.path);

  // Listen for response finish to log completion
  res.on("finish", () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const statusCode = res.statusCode;

    // Set response tags
    Sentry.setTag("http.status_code", statusCode.toString());

    // Log API call completion
    const level =
      statusCode >= 500 ? "error" : statusCode >= 400 ? "warning" : "info";

    if (statusCode >= 400) {
      Sentry.logger.error(`API Call Failed: ${req.method} ${req.path}`, {
        action: "api_call_error",
        method: req.method,
        path: req.path,
        statusCode,
        duration,
        userId: req.user?.userId,
        query: req.query,
        body: req.body,
      });
    } else {
      Sentry.logger.info(`API Call Success: ${req.method} ${req.path}`, {
        action: "api_call_success",
        method: req.method,
        path: req.path,
        statusCode,
        duration,
        userId: req.user?.userId,
      });
    }

    Sentry.captureMessage(
      `API ${statusCode}: ${req.method} ${req.path} (${duration}ms)`,
      level
    );

    // Add response breadcrumb
    Sentry.addBreadcrumb({
      message: `API Response: ${req.method} ${req.path} - ${statusCode} (${duration}ms)`,
      category: "http.response",
      level: statusCode >= 400 ? "error" : "info",
      data: {
        method: req.method,
        path: req.path,
        status_code: statusCode,
        duration,
        user_id: req.user?.userId,
      },
    });

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      Sentry.captureMessage(
        `Slow API Request: ${req.method} ${req.path} took ${duration}ms`,
        "warning"
      );
    }

    // Transaction is automatically finished with startSpan
  });

  next();
};

/**
 * Middleware to capture business events
 */
export const sentryBusinessLogger = (eventType: string) => {
  return (req: SentryRequest, res: Response, next: NextFunction): void => {
    // Log business event
    Sentry.captureMessage(`Business Event: ${eventType}`, "info");

    // Add business event breadcrumb
    Sentry.addBreadcrumb({
      message: `Business Event: ${eventType}`,
      category: "business",
      level: "info",
      data: {
        event_type: eventType,
        user_id: req.user?.userId,
        endpoint: req.path,
        method: req.method,
      },
    });

    // Set business context
    Sentry.setContext("business_event", {
      type: eventType,
      timestamp: new Date().toISOString(),
      user_id: req.user?.userId,
      endpoint: req.path,
    });

    next();
  };
};

/**
 * Middleware to log database operations
 */
export const sentryDatabaseLogger = (operation: string) => {
  return (req: SentryRequest, res: Response, next: NextFunction): void => {
    // Add database operation breadcrumb
    Sentry.addBreadcrumb({
      message: `Database Operation: ${operation}`,
      category: "database",
      level: "info",
      data: {
        operation,
        endpoint: req.path,
        method: req.method,
        user_id: req.user?.userId,
      },
    });

    next();
  };
};
