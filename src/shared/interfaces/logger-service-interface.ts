export interface ILoggerService {
  info(message: string, ...args: any[]): void;
  error(message: string, error?: Error | any, context?: any): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  logBusinessEvent(event: string, data?: any): void;
  logApiOperation(
    operation: string,
    method: string,
    path: string,
    userId?: number,
    data?: any
  ): void;
  withLogging<T>(
    operation: () => Promise<T>,
    context: { operation: string; userId?: number; [key: string]: any }
  ): Promise<T>;
}
