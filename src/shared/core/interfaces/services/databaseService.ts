export interface IDatabaseService {
  // Core query methods
  executeQuery<T>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]>;

  select<T>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]>;

  insert<T>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]>;

  update<T>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]>;

  delete<T>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]>;

  // Connection management
  isConnected(): boolean;
  getConnectionInfo(): string;
  closeConnection?(): Promise<void>;

  // Transaction support
  withTransaction?<T>(callback: (client: any) => Promise<T>): Promise<T>;
}
