import { ILoggerService } from "../interfaces/logger-service-interface";
import { LoggerService } from "../services/logger-service";

export class LoggerFactory {
  private static instance: ILoggerService;

  /**
   * Get singleton logger instance
   */
  public static getInstance(): ILoggerService {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerService();
    }
    return LoggerFactory.instance;
  }

  /**
   * Create new logger instance (for testing)
   */
  public static createInstance(): ILoggerService {
    return new LoggerService();
  }

  /**
   * Set custom logger instance (for testing with mocks)
   */
  public static setInstance(logger: ILoggerService): void {
    LoggerFactory.instance = logger;
  }

  /**
   * Reset singleton (for testing)
   */
  public static reset(): void {
    LoggerFactory.instance = undefined as any;
  }
}
