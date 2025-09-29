import { Pool, QueryResult, PoolClient } from "pg";
import dotenv from "dotenv";
import { IDatabaseService } from "../../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../../shared/core/interfaces/loggerService";

dotenv.config();

export class PostgresDatabaseService implements IDatabaseService {
  private static instance: PostgresDatabaseService;
  private pool: Pool | null = null;
  private logger: ILoggerService;

  private constructor(logger: ILoggerService) {
    this.logger = logger;
    this.validateEnvironmentVariables();
  }

  public static async getInstance(
    logger: ILoggerService
  ): Promise<PostgresDatabaseService> {
    if (!PostgresDatabaseService.instance) {
      PostgresDatabaseService.instance = new PostgresDatabaseService(logger);
      await PostgresDatabaseService.instance.initializeConnection();
    }
    return PostgresDatabaseService.instance;
  }

  public static createInstance(
    logger: ILoggerService
  ): PostgresDatabaseService {
    if (!PostgresDatabaseService.instance) {
      PostgresDatabaseService.instance = new PostgresDatabaseService(logger);
      // Note: Connection will be initialized lazily when first query is made
    }
    return PostgresDatabaseService.instance;
  }

  private getSSLConfig() {
    // Check if SSL is explicitly disabled
    if (process.env.DB_SSL_DISABLED === "true") {
      return false;
    }

    // For cloud databases or production, always use SSL
    if (
      process.env.NODE_ENV === "production" ||
      process.env.DB_SSL_REQUIRED === "true" ||
      process.env.DB_HOST?.includes("amazonaws.com") ||
      process.env.DB_HOST?.includes("digitalocean.com") ||
      process.env.DB_HOST?.includes("aiven.io") ||
      process.env.DB_HOST?.includes("neon.tech") ||
      !process.env.DB_HOST?.includes("localhost")
    ) {
      return {
        rejectUnauthorized: false, // Allow self-signed certificates
        // Add CA certificate if provided
        ...(process.env.DB_SSL_CA && { ca: process.env.DB_SSL_CA }),
      };
    }

    // Default to no SSL for localhost
    return false;
  }

  private validateEnvironmentVariables(): void {
    const requiredEnvVars = [
      "DB_HOST",
      "DB_PORT",
      "DB_USER",
      "DB_PASSWORD",
      "DB_NAME",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required PostgreSQL environment variables: ${missingEnvVars.join(
          ", "
        )}`
      );
    }

    const port = parseInt(process.env.DB_PORT!);
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(
        "DB_PORT must be a valid port number between 1 and 65535"
      );
    }
  }

  private async initializeConnection(): Promise<void> {
    if (!this.pool) {
      this.pool = new Pool({
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!),
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,

        // Connection pool configuration
        max: parseInt(process.env.DB_POOL_MAX || "10"),
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
        connectionTimeoutMillis: parseInt(
          process.env.DB_CONNECTION_TIMEOUT || "2000"
        ),
        maxUses: parseInt(process.env.DB_MAX_USES || "7500"),

        // SSL configuration - handle different environments
        ssl: this.getSSLConfig(),
      });

      // Test connection
      const client: PoolClient = await this.pool.connect();
      try {
        await client.query("SELECT NOW()");
        this.logger.info(
          `PostgreSQL connection pool established (max connections: ${this.pool.options.max})`
        );
      } finally {
        client.release();
      }

      // Handle pool errors
      this.pool.on("error", (err) => {
        this.logger.error("PostgreSQL pool error", { error: err.message });
      });
    }
  }

  public async executeQuery<T = unknown>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]> {
    if (!this.pool) {
      throw new Error("PostgreSQL pool not initialized");
    }

    const startTime = Date.now();
    let client: PoolClient | null = null;

    try {
      // Log query in development
      if (process.env.NODE_ENV === "development" && queryIdentifier) {
        this.logger.info(`Executing PostgreSQL query: ${queryIdentifier}`);
      }

      client = await this.pool.connect();
      const result: QueryResult = await client.query(query, values);

      const executionTime = Date.now() - startTime;

      if (process.env.NODE_ENV === "development" && queryIdentifier) {
        this.logger.info(`Query completed: ${queryIdentifier}`, {
          executionTime: `${executionTime}ms`,
          rowsReturned: result.rows.length,
        });
      }

      return result.rows as T[];
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      this.logger.error(
        `PostgreSQL query failed: ${queryIdentifier || "Unknown"}`,
        {
          error: error.message,
          executionTime: `${executionTime}ms`,
          query: query.substring(0, 200) + (query.length > 200 ? "..." : ""),
          parameters: values,
        }
      );
      throw new Error(`PostgreSQL query execution failed: ${error.message}`);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  public async select<T = unknown>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]> {
    return this.executeQuery<T>(query, values, queryIdentifier);
  }

  public async insert<T = unknown>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]> {
    return this.executeQuery<T>(query, values, queryIdentifier);
  }

  public async update<T = unknown>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]> {
    return this.executeQuery<T>(query, values, queryIdentifier);
  }

  public async delete<T = unknown>(
    query: string,
    values?: unknown[],
    queryIdentifier?: string
  ): Promise<T[]> {
    return this.executeQuery<T>(query, values, queryIdentifier);
  }

  public isConnected(): boolean {
    try {
      return this.pool !== null && !this.pool.ended;
    } catch {
      return false;
    }
  }

  public getConnectionInfo(): string {
    return `PostgreSQL Database Service - Pool size: ${
      this.pool?.totalCount || 0
    }/${this.pool?.options.max || 0}`;
  }

  public async closeConnection(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.logger.info("PostgreSQL connection pool closed");
    }
  }

  // Transaction support
  public async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      throw new Error("PostgreSQL pool not initialized");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
