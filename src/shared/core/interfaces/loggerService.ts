export interface ILoggerService {
  info(message: string, ...args: any[]): void;
  error(message: string, error?: Error | any): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}
