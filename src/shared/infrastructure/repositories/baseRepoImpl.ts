import { BaseRepository } from "../../repositories/baseRepository";
import { QueryResultRow } from "pg";
import { EConnectionTypes } from "../config/database";

// Base repository implementation following Clean Architecture guide patterns
export class BaseRepoImpl extends BaseRepository {
  protected connectionType: EConnectionTypes;

  constructor(connectionType: EConnectionTypes = EConnectionTypes.main) {
    super();
    this.connectionType = connectionType;
  }

  protected getConnectionType(): string {
    return this.connectionType;
  }

  // Example of how to use the base repository methods
  protected async findById<T>(
    table: string,
    id: string | number,
    columns: string[] = ["*"]
  ): Promise<T | null> {
    const { query, params } = this.buildSelectQuery(table, columns, "id = $1");

    const result = await this.executeQuery<T & QueryResultRow>(query, [id]);
    return result.rows.length > 0 ? result.rows[0]! : null;
  }

  protected async findAll<T>(
    table: string,
    options: {
      columns?: string[];
      whereClause?: string;
      whereParams?: any[];
      orderBy?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<T[]> {
    const { columns = ["*"], whereClause, orderBy, limit, offset } = options;

    const { query, params } = this.buildSelectQuery(
      table,
      columns,
      whereClause,
      orderBy,
      limit,
      offset
    );

    const allParams =
      whereClause && options.whereParams
        ? [...options.whereParams, ...params]
        : params;

    const result = await this.executeQuery<T & QueryResultRow>(
      query,
      allParams
    );
    return result.rows;
  }

  protected async create<T>(
    table: string,
    data: Record<string, any>,
    returningColumns: string[] = ["id"]
  ): Promise<T> {
    const { query, params } = this.buildInsertQuery(
      table,
      data,
      returningColumns
    );

    const result = await this.executeQuery<T & QueryResultRow>(query, params);
    return result.rows[0]!;
  }

  protected async update<T>(
    table: string,
    id: string | number,
    data: Record<string, any>,
    returningColumns: string[] = ["id"]
  ): Promise<T | null> {
    const { query, params } = this.buildUpdateQuery(
      table,
      data,
      "id = $" + (Object.keys(data).length + 1),
      [id],
      returningColumns
    );

    const result = await this.executeQuery<T & QueryResultRow>(query, params);
    return result.rows.length > 0 ? result.rows[0]! : null;
  }

  protected async delete(table: string, id: string | number): Promise<boolean> {
    const { query, params } = this.buildDeleteQuery(table, "id = $1", [id]);

    const result = await this.executeQuery(query, params);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Paginated find with count
  protected async findWithPagination<T>(
    table: string,
    options: {
      columns?: string[];
      whereClause?: string;
      whereParams?: any[];
      orderBy?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const {
      columns = ["*"],
      whereClause,
      whereParams,
      orderBy,
      page = 1,
      limit = 20,
    } = options;

    // Get total count
    const total = await this.getCount(table, whereClause, whereParams);

    // Get paginated data
    const offset = (page - 1) * limit;
    const data = await this.findAll<T>(table, {
      columns,
      ...(whereClause && { whereClause }),
      ...(whereParams && { whereParams }),
      ...(orderBy && { orderBy }),
      limit,
      offset,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Bulk operations
  protected async bulkInsert<T>(
    table: string,
    dataArray: Record<string, any>[],
    returningColumns: string[] = ["id"]
  ): Promise<T[]> {
    if (dataArray.length === 0) return [];

    const columns = Object.keys(dataArray[0]!);
    const values: any[] = [];
    const placeholders: string[] = [];

    dataArray.forEach((data, rowIndex) => {
      const rowPlaceholders = columns.map(
        (_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`
      );
      placeholders.push(`(${rowPlaceholders.join(", ")})`);
      values.push(...Object.values(data));
    });

    const query = `
      INSERT INTO ${table} (${columns.join(", ")})
      VALUES ${placeholders.join(", ")}
      RETURNING ${returningColumns.join(", ")}
    `;

    const result = await this.executeQuery<T & QueryResultRow>(query, values);
    return result.rows;
  }

  // Check if record exists
  protected async exists(
    table: string,
    whereClause: string,
    whereParams: any[]
  ): Promise<boolean> {
    const query = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${whereClause}) as exists`;
    const result = await this.executeQuery<{ exists: boolean }>(
      query,
      whereParams
    );
    return result.rows[0]!.exists;
  }
}
