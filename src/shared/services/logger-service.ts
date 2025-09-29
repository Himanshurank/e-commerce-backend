import * as Sentry from "@sentry/node";
import { ILoggerService } from "../interfaces/logger-service-interface";

export class LoggerService implements ILoggerService {
  public info(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[INFO] ${timestamp}: ${message}`;

    // Console output for local development
    console.log(logMessage, ...args);

    // Send to Sentry
    Sentry.logger.info(message, {
      level: "info",
      timestamp,
      additionalData: args.length > 0 ? args : undefined,
    });
  }

  public error(message: string, error?: Error | any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[ERROR] ${timestamp}: ${message}`;

    // Console output for local development
    console.error(logMessage, error);

    // Send to Sentry with error context
    if (error instanceof Error) {
      Sentry.logger.error(message, {
        level: "error",
        timestamp,
        error: error.message,
        stack: error.stack,
      });
    } else {
      Sentry.logger.error(message, {
        level: "error",
        timestamp,
        errorData: error,
      });
    }
  }

  public warn(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[WARN] ${timestamp}: ${message}`;

    // Console output for local development
    console.warn(logMessage, ...args);

    // Send to Sentry
    Sentry.logger.warn(message, {
      level: "warning",
      timestamp,
      additionalData: args.length > 0 ? args : undefined,
    });
  }

  public debug(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[DEBUG] ${timestamp}: ${message}`;

    // Only log debug in development
    if (process.env["NODE_ENV"] === "development") {
      console.debug(logMessage, ...args);

      // Send to Sentry only in development
      Sentry.logger.debug(message, {
        level: "debug",
        timestamp,
        additionalData: args.length > 0 ? args : undefined,
      });
    }
  }

  /**
   * Log business events with structured data
   */
  public logBusinessEvent(event: string, data: any = {}): void {
    const timestamp = new Date().toISOString();
    const message = `Business Event: ${event}`;

    console.log(`[INFO] ${timestamp}: ${message}`, data);

    Sentry.logger.info(message, {
      level: "info",
      timestamp,
      action: "business_event",
      event,
      ...data,
    });
  }

  /**
   * Log API operations with context
   */
  public logApiOperation(
    operation: string,
    method: string,
    path: string,
    userId?: number,
    data: any = {}
  ): void {
    const timestamp = new Date().toISOString();
    const message = `API ${operation}: ${method} ${path}`;

    console.log(`[INFO] ${timestamp}: ${message}`, { userId, ...data });

    Sentry.logger.info(message, {
      level: "info",
      timestamp,
      action: "api_operation",
      operation,
      method,
      path,
      userId,
      ...data,
    });
  }

  /**
   * Wrap async operations with automatic success/error logging
   */
  public async withLogging<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      userId?: number;
      [key: string]: any;
    }
  ): Promise<T> {
    const startTime = Date.now();

    try {
      this.info(`Starting ${context.operation}`, { userId: context.userId });

      const result = await operation();
      const duration = Date.now() - startTime;

      this.info(`${context.operation} completed successfully`, {
        ...context,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.error(`${context.operation} failed`, error as Error);

      // Also log to Sentry with additional context
      Sentry.logger.error(`${context.operation} failed`, {
        level: "error",
        action: `${context.operation}_error`,
        duration: `${duration}ms`,
        ...context,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  }
}
