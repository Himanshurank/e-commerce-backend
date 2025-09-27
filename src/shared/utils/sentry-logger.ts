import * as Sentry from "@sentry/node";

/**
 * Simple Sentry logger utility for easy use throughout the application
 */
export class SentryLogger {
  /**
   * Log successful operations
   */
  static logSuccess(message: string, data: any = {}): void {
    Sentry.logger.info(message, {
      action: data.action || "operation_success",
      ...data,
    });
  }

  /**
   * Log errors with context
   */
  static logError(message: string, error: Error, data: any = {}): void {
    Sentry.logger.error(message, {
      action: data.action || "operation_error",
      error: error.message,
      stack: error.stack,
      ...data,
    });
  }

  /**
   * Log API calls
   */
  static logApiCall(
    method: string,
    path: string,
    userId?: number,
    data: any = {}
  ): void {
    Sentry.logger.info(`API: ${method} ${path}`, {
      action: "api_call",
      method,
      path,
      userId,
      ...data,
    });
  }

  /**
   * Log business events
   */
  static logBusinessEvent(event: string, data: any = {}): void {
    Sentry.logger.info(`Business Event: ${event}`, {
      action: "business_event",
      event,
      ...data,
    });
  }

  /**
   * Wrap any async function with error logging
   */
  static async withLogging<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      userId?: number;
      [key: string]: any;
    }
  ): Promise<T> {
    try {
      const result = await operation();

      this.logSuccess(`${context.operation} completed`, {
        action: `${context.operation}_success`,
        ...context,
      });

      return result;
    } catch (error) {
      this.logError(`${context.operation} failed`, error as Error, {
        action: `${context.operation}_error`,
        ...context,
      });
      throw error;
    }
  }
}

/**
 * Simple decorator for logging method calls
 */
export function LogOperation(operationName: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await method.apply(this, args);

        SentryLogger.logSuccess(`${operationName} completed`, {
          action: `${operationName}_success`,
          method: propertyName,
          class: target.constructor.name,
        });

        return result;
      } catch (error) {
        SentryLogger.logError(`${operationName} failed`, error as Error, {
          action: `${operationName}_error`,
          method: propertyName,
          class: target.constructor.name,
        });
        throw error;
      }
    };
  };
}
