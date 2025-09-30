import * as Sentry from "@sentry/node";
import { ILoggerService } from "../core/interfaces/loggerService";

export class LoggerService implements ILoggerService {
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.initializeSentry();
  }

  private initializeSentry(): void {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: this.isDevelopment ? 1.0 : 0.1,
        profilesSampleRate: this.isDevelopment ? 1.0 : 0.1,
        integrations: [
          // send console.log, console.warn, and console.error calls as logs to Sentry
          Sentry.consoleLoggingIntegration({
            levels: ["log", "warn", "error", "debug", "info"],
          }),
        ],
        enableLogs: true,
        // Set default tags for all Sentry events
        initialScope: {
          tags: {
            environment: process.env.NODE_ENV || "development",
            service: "e-commerce-backend",
            version: "1.0.0",
          },
        },
        // Global context that will be added to every event
        beforeSend: (event) => {
          // Ensure environment is always present
          event.environment = process.env.NODE_ENV || "development";

          // Add custom tags to every event
          event.tags = {
            ...event.tags,
            environment: process.env.NODE_ENV || "development",
            service: "e-commerce-backend",
            logger: "LoggerService",
          };

          // Add server info to context
          event.contexts = {
            ...event.contexts,
            server: {
              environment: process.env.NODE_ENV || "development",
              uptime: process.uptime(),
              pid: process.pid,
              platform: process.platform,
              node_version: process.version,
            },
          };

          return event;
        },
      });
    }
  }

  public info(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    console.log(
      `[INFO] [${process.env.NODE_ENV}] ${timestamp}: ${message}`,
      ...args
    );

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      message,
      level: "info",
      ...(args.length > 0 && { data: { context: args } }),
    });
  }

  public error(message: string, error?: Error | any): void {
    const timestamp = new Date().toISOString();
    console.error(
      `[ERROR] [${process.env.NODE_ENV}] ${timestamp}: ${message}`,
      error
    );

    // Send to Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: { source: "LoggerService" },
        extra: { message, timestamp },
      });
    } else {
      Sentry.captureMessage(`${message}: ${JSON.stringify(error)}`, "error");
    }
  }

  public warn(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp}: ${message}`, ...args);

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      message,
      level: "warning",
      ...(args.length > 0 && { data: { context: args } }),
    });
  }

  public debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      console.debug(`[DEBUG] ${timestamp}: ${message}`, ...args);

      // Only add debug breadcrumbs in development
      Sentry.addBreadcrumb({
        message: `[${process.env.NODE_ENV}] ${message}`,
        level: "debug",
        ...(args.length > 0 && { data: { context: args } }),
      });
    }
  }

  // Additional Sentry-specific methods
  public setUser(user: {
    id: string;
    email?: string;
    username?: string;
  }): void {
    Sentry.setUser(user);
  }

  public setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  public setContext(key: string, context: Record<string, any>): void {
    Sentry.setContext(key, context);
  }

  public captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info"
  ): void {
    Sentry.captureMessage(message, level);
  }
}
