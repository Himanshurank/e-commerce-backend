import { QueryResult, PoolClient, QueryResultRow } from "pg";
import { LoggerFactory } from "../factories/logger-factory";

// Base repository interface following Clean Architecture patterns
export interface BaseRepo {
  // Health check method
  ping(): Promise<boolean>;
}

// Base repository implementation with common database operations
export abstract class BaseRepository implements BaseRepo {
  protected abstract getConnectionType(): string;

  // Execute a simple query
  protected async executeQuery<T extends QueryResultRow = any>(
    query: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const { DatabaseFactory } = await import("../factories/databaseFactory");
    const { EConnectionTypes } = await import(
      "../infrastructure/config/database"
    );

    const connectionType =
      this.getConnectionType() as keyof typeof EConnectionTypes;
    const dbService = DatabaseFactory.getDatabase(
      EConnectionTypes[connectionType]
    );

    return await dbService.query<T>(query, params);
  }

  // Execute multiple queries in a transaction
  protected async executeTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const { DatabaseFactory } = await import("../factories/databaseFactory");
    const { EConnectionTypes } = await import(
      "../infrastructure/config/database"
    );

    const connectionType =
      this.getConnectionType() as keyof typeof EConnectionTypes;
    const dbService = DatabaseFactory.getDatabase(
      EConnectionTypes[connectionType]
    );

    return await dbService.transaction(callback);
  }

  // Get a database client for complex operations
  protected async getClient(): Promise<PoolClient> {
    const { DatabaseFactory } = await import("../factories/databaseFactory");
    const { EConnectionTypes } = await import(
      "../infrastructure/config/database"
    );

    const connectionType =
      this.getConnectionType() as keyof typeof EConnectionTypes;
    const dbService = DatabaseFactory.getDatabase(
      EConnectionTypes[connectionType]
    );

    return await dbService.getClient();
  }

  // Health check implementation
  async ping(): Promise<boolean> {
    try {
      const { DatabaseFactory } = await import("../factories/databaseFactory");
      const { EConnectionTypes } = await import(
        "../infrastructure/config/database"
      );

      const connectionType =
        this.getConnectionType() as keyof typeof EConnectionTypes;
      const dbService = DatabaseFactory.getDatabase(
        EConnectionTypes[connectionType]
      );

      return await dbService.ping();
    } catch (error) {
      const logger = LoggerFactory.getInstance();
      logger.error(
        `Repository ping failed for ${this.getConnectionType()}`,
        error as Error
      );
      return false;
    }
  }

  // Common query builders
  protected buildSelectQuery(
    table: string,
    columns: string[] = ["*"],
    whereClause?: string,
    orderBy?: string,
    limit?: number,
    offset?: number
  ): { query: string; params: any[] } {
    let query = `SELECT ${columns.join(", ")} FROM ${table}`;
    const params: any[] = [];
    let paramIndex = 1;

    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(offset);
    }

    return { query, params };
  }

  protected buildInsertQuery(
    table: string,
    data: Record<string, any>,
    returningColumns: string[] = ["id"]
  ): { query: string; params: any[] } {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const query = `
      INSERT INTO ${table} (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING ${returningColumns.join(", ")}
    `;

    return { query, params: values };
  }

  protected buildUpdateQuery(
    table: string,
    data: Record<string, any>,
    whereClause: string,
    whereParams: any[] = [],
    returningColumns: string[] = ["id"]
  ): { query: string; params: any[] } {
    const columns = Object.keys(data);
    const values = Object.values(data);

    const setClause = columns
      .map((col, index) => `${col} = $${index + 1}`)
      .join(", ");

    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING ${returningColumns.join(", ")}
    `;

    return { query, params: [...values, ...whereParams] };
  }

  protected buildDeleteQuery(
    table: string,
    whereClause: string,
    whereParams: any[] = []
  ): { query: string; params: any[] } {
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    return { query, params: whereParams };
  }

  // Pagination helper
  protected buildPaginationQuery(
    baseQuery: string,
    page: number = 1,
    limit: number = 20
  ): { query: string; offset: number; limit: number } {
    const offset = (page - 1) * limit;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

    return { query, offset, limit };
  }

  // Count helper for pagination
  protected async getCount(
    table: string,
    whereClause?: string,
    whereParams?: any[]
  ): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${table}${
      whereClause ? ` WHERE ${whereClause}` : ""
    }`;

    const result = await this.executeQuery<{ count: string }>(
      query,
      whereParams
    );

    return parseInt(result.rows[0]?.count || "0", 10);
  }
}
