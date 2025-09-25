import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import {
  EConnectionTypes,
  DatabaseConfig,
  getDatabaseConfig,
} from "../config/database";

// Database service interface following Clean Architecture patterns
export interface DatabaseService {
  query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>>;
  transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
  getClient(): Promise<PoolClient>;
  end(): Promise<void>;
  ping(): Promise<boolean>;
}

// PostgreSQL database service implementation
export class PostgreSQLDatabaseService implements DatabaseService {
  private pool: Pool;
  private connectionType: EConnectionTypes;

  constructor(connectionType: EConnectionTypes) {
    this.connectionType = connectionType;
    const config = getDatabaseConfig();

    // Only allow main and logs connections for now
    if (
      connectionType !== EConnectionTypes.main &&
      connectionType !== EConnectionTypes.logs
    ) {
      throw new Error(`Unsupported connection type: ${connectionType}`);
    }

    const dbConfig = config[connectionType];

    if (!dbConfig) {
      throw new Error(
        `Database configuration not found for connection: ${connectionType}`
      );
    }

    this.pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.username,
      password: dbConfig.password,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
      max: dbConfig.maxConnections,
      idleTimeoutMillis: dbConfig.idleTimeoutMillis,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on("error", (err) => {
      console.error(`Database pool error for ${connectionType}:`, err);
    });
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;

      console.log(`Query executed on ${this.connectionType}`, {
        duration: `${duration}ms`,
        rows: result.rowCount,
        command: result.command,
      });

      return result;
    } catch (error) {
      console.error(`Query error on ${this.connectionType}:`, {
        error: error instanceof Error ? error.message : error,
        query: text,
        params,
      });
      throw error;
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
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

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async ping(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      console.error(`Database ping failed for ${this.connectionType}:`, error);
      return false;
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
  }

  // Get pool statistics
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}
