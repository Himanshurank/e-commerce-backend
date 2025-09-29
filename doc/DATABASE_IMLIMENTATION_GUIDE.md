# PostgreSQL Implementation Guide - Clean Architecture

## Table of Contents

1. [Overview](#overview)
2. [PostgreSQL Architecture Pattern](#postgresql-architecture-pattern)
3. [Implementation Steps](#implementation-steps)
4. [PostgreSQL Service Implementation](#postgresql-service-implementation)
5. [Repository Patterns](#repository-patterns)
6. [Migration Management](#migration-management)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide demonstrates how to implement PostgreSQL database layer in a Clean Architecture TypeScript project. It covers connection management, repository patterns, migrations, and best practices for maintainable PostgreSQL integration.

### Core Principles

- **Interface-First Design**: All database operations go through interfaces
- **Dependency Injection**: Database services are injected, never instantiated directly
- **Connection Pooling**: Efficient connection management for production
- **Environment Validation**: Comprehensive configuration validation
- **Graceful Shutdown**: Proper cleanup of database connections

---

## PostgreSQL Architecture Pattern

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  Controllers receive IDatabaseService via factories         │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  Use Cases receive repository interfaces (not DB directly)  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                       │
│  Repositories implement domain interfaces                   │
│  PostgreSQL Service implements IDatabaseService             │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                           │
│  IDatabaseService interface defines contracts               │
│  Repository interfaces define data operations               │
└─────────────────────────────────────────────────────────────┘
```

### Database Service Interface

```typescript
// src/shared/core/interfaces/services/databaseService.ts
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
```

---

## Implementation Steps

### Step 1: Define Domain Interfaces

```typescript
// src/domain/interfaces/infrastructure/repositories/userRepository.ts
import { User } from "../../../entities/auth/user";
import {
  TCreateUserParams,
  TUserRecord,
} from "../../../types/infrastructure/repositories/userRepository";

export interface IUserRepository {
  create(params: TCreateUserParams): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, params: Partial<TCreateUserParams>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

### Step 2: Define Database Types

```typescript
// src/domain/types/infrastructure/repositories/userRepository.ts
import { UserStatus } from "../../../enum/userStatus";

export type TUserRecord = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: UserStatus;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type TCreateUserParams = {
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
};

export type TUpdateUserParams = {
  firstName?: string;
  lastName?: string;
  status?: UserStatus;
};
```

### Step 3: Implement PostgreSQL Service

```typescript
// src/infrastructure/externalServices/database/postgresDatabaseService.ts
import { Pool, QueryResult, PoolClient } from "pg";
import dotenv from "dotenv";
import { IDatabaseService } from "../../../shared/core/interfaces/services/databaseService";

dotenv.config();

export class PostgresDatabaseService implements IDatabaseService {
  private static instance: PostgresDatabaseService;
  private pool: Pool | null = null;

  private constructor() {
    this.validateEnvironmentVariables();
  }

  public static async getInstance(): Promise<PostgresDatabaseService> {
    if (!PostgresDatabaseService.instance) {
      PostgresDatabaseService.instance = new PostgresDatabaseService();
      await PostgresDatabaseService.instance.initializeConnection();
    }
    return PostgresDatabaseService.instance;
  }

  private validateEnvironmentVariables(): void {
    const requiredEnvVars = [
      "POSTGRES_HOST",
      "POSTGRES_PORT",
      "POSTGRES_USER",
      "POSTGRES_PASSWORD",
      "POSTGRES_DATABASE",
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

    const port = parseInt(process.env.POSTGRES_PORT!);
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(
        "POSTGRES_PORT must be a valid port number between 1 and 65535"
      );
    }
  }

  private async initializeConnection(): Promise<void> {
    if (!this.pool) {
      this.pool = new Pool({
        host: process.env.POSTGRES_HOST!,
        port: parseInt(process.env.POSTGRES_PORT!),
        user: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_PASSWORD!,
        database: process.env.POSTGRES_DATABASE!,

        // Connection pool configuration
        max: parseInt(process.env.POSTGRES_POOL_MAX || "10"),
        idleTimeoutMillis: parseInt(
          process.env.POSTGRES_IDLE_TIMEOUT || "30000"
        ),
        connectionTimeoutMillis: parseInt(
          process.env.POSTGRES_CONNECTION_TIMEOUT || "2000"
        ),
        maxUses: parseInt(process.env.POSTGRES_MAX_USES || "7500"),

        // SSL configuration
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      });

      // Test connection
      const client: PoolClient = await this.pool.connect();
      try {
        await client.query("SELECT NOW()");
        console.log(
          `✅ PostgreSQL connection pool established (max connections: ${this.pool.options.max})`
        );
      } finally {
        client.release();
      }

      // Handle pool errors
      this.pool.on("error", (err) => {
        console.error("PostgreSQL pool error:", err);
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
        console.log(
          `🔍 [${queryIdentifier}] Executing PostgreSQL query:`,
          query
        );
        if (values && values.length > 0) {
          console.log(`📊 [${queryIdentifier}] Parameters:`, values);
        }
      }

      client = await this.pool.connect();
      const result: QueryResult = await client.query(query, values);

      const executionTime = Date.now() - startTime;

      if (process.env.NODE_ENV === "development" && queryIdentifier) {
        console.log(
          `✅ [${queryIdentifier}] Query completed in ${executionTime}ms, returned ${result.rows.length} rows`
        );
      }

      return result.rows as T[];
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(
        `❌ PostgreSQL query failed [${
          queryIdentifier || "Unknown"
        }] after ${executionTime}ms:`,
        {
          error: error.message,
          query: query.substring(0, 200) + (query.length > 200 ? "..." : ""),
          values: values,
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
      console.log("PostgreSQL connection pool closed");
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
```

### Step 4: Create Database Factory

```typescript
// src/infrastructure/factories/databaseServiceFactory.ts
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { PostgresDatabaseService } from "../externalServices/database/postgresDatabaseService";

export class DatabaseServiceFactory {
  public static async createPostgresService(): Promise<IDatabaseService> {
    return await PostgresDatabaseService.getInstance();
  }

  public static async closeAllConnections(): Promise<void> {
    const postgresInstance = PostgresDatabaseService["instance"];
    if (postgresInstance) {
      await postgresInstance.closeConnection();
    }
    console.log("PostgreSQL connection closed");
  }
}
```

### Step 5: Implement Repository

```typescript
// src/infrastructure/repositories/userRepoImpl.ts
import { IUserRepository } from "../../domain/interfaces/infrastructure/repositories/userRepository";
import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { User } from "../../domain/entities/auth/user";
import {
  TCreateUserParams,
  TUserRecord,
  TUpdateUserParams,
} from "../../domain/types/infrastructure/repositories/userRepository";
import { IdGeneratorService } from "../externalServices/idGeneratorService";

export class UserRepoImpl implements IUserRepository {
  private readonly tableName = "users";

  constructor(private readonly databaseService: IDatabaseService) {}

  async create(params: TCreateUserParams): Promise<User> {
    const user = User.create({
      id: IdGeneratorService.getInstance().generateUUID(),
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      status: params.status,
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    const query = `
      INSERT INTO ${this.tableName} (
        id, email, first_name, last_name, status, is_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.status,
      user.isVerified,
      user.createdAt,
      user.updatedAt,
    ];

    const result = await this.databaseService.insert<TUserRecord>(
      query,
      values,
      "createUser"
    );
    return User.create(result[0]);
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, status, is_verified, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [id],
      "findUserById"
    );
    return result[0] ? User.create(result[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, status, is_verified, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE email = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [email],
      "findUserByEmail"
    );
    return result[0] ? User.create(result[0]) : null;
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT id, email, first_name, last_name, status, is_verified, created_at, updated_at, deleted_at
      FROM ${this.tableName}
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [],
      "findAllUsers"
    );
    return result.map((userRecord) => User.create(userRecord));
  }

  async update(id: string, params: TUpdateUserParams): Promise<User> {
    const setParts: string[] = [];
    const values: any[] = [id];
    let paramIndex = 2;

    if (params.firstName !== undefined) {
      setParts.push(`first_name = $${paramIndex}`);
      values.push(params.firstName);
      paramIndex++;
    }

    if (params.lastName !== undefined) {
      setParts.push(`last_name = $${paramIndex}`);
      values.push(params.lastName);
      paramIndex++;
    }

    if (params.status !== undefined) {
      setParts.push(`status = $${paramIndex}`);
      values.push(params.status);
      paramIndex++;
    }

    setParts.push(`updated_at = NOW()`);

    const query = `
      UPDATE ${this.tableName}
      SET ${setParts.join(", ")}
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await this.databaseService.update<TUserRecord>(
      query,
      values,
      "updateUser"
    );

    if (!result[0]) {
      throw new Error("User not found");
    }

    return User.create(result[0]);
  }

  async delete(id: string): Promise<void> {
    const query = `
      UPDATE ${this.tableName}
      SET deleted_at = NOW()
      WHERE id = $1
    `;

    await this.databaseService.update(query, [id], "deleteUser");
  }
}
```

---

## PostgreSQL Service Implementation

### Environment Variables

```bash
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DATABASE=mydatabase

# Connection Pool Configuration (Optional)
POSTGRES_POOL_MAX=10
POSTGRES_IDLE_TIMEOUT=30000
POSTGRES_CONNECTION_TIMEOUT=2000
POSTGRES_MAX_USES=7500

# SSL Configuration (Production)
POSTGRES_SSL_ENABLED=true
POSTGRES_SSL_REJECT_UNAUTHORIZED=false
POSTGRES_SSL_CA=path/to/ca-cert.pem
POSTGRES_SSL_KEY=path/to/client-key.pem
POSTGRES_SSL_CERT=path/to/client-cert.pem
```

### Multiple PostgreSQL Instances

```typescript
// For projects requiring multiple PostgreSQL databases
export class PostgresDatabaseService implements IDatabaseService {
  private static mainInstance: PostgresDatabaseService;
  private static analyticsInstance: PostgresDatabaseService;
  private pool: Pool | null = null;
  private dbType: "main" | "analytics";

  private constructor(dbType: "main" | "analytics") {
    this.dbType = dbType;
    this.validateEnvironmentVariables();
  }

  public static async getMainInstance(): Promise<PostgresDatabaseService> {
    if (!PostgresDatabaseService.mainInstance) {
      PostgresDatabaseService.mainInstance = new PostgresDatabaseService(
        "main"
      );
      await PostgresDatabaseService.mainInstance.initializeConnection();
    }
    return PostgresDatabaseService.mainInstance;
  }

  public static async getAnalyticsInstance(): Promise<PostgresDatabaseService> {
    if (!PostgresDatabaseService.analyticsInstance) {
      PostgresDatabaseService.analyticsInstance = new PostgresDatabaseService(
        "analytics"
      );
      await PostgresDatabaseService.analyticsInstance.initializeConnection();
    }
    return PostgresDatabaseService.analyticsInstance;
  }

  private validateEnvironmentVariables(): void {
    const requiredEnvVars = [
      "POSTGRES_HOST",
      "POSTGRES_PORT",
      "POSTGRES_USER",
      "POSTGRES_PASSWORD",
      this.dbType === "main"
        ? "POSTGRES_MAIN_DATABASE"
        : "POSTGRES_ANALYTICS_DATABASE",
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
  }

  private async initializeConnection(): Promise<void> {
    if (!this.pool) {
      const dbName =
        this.dbType === "main"
          ? process.env.POSTGRES_MAIN_DATABASE!
          : process.env.POSTGRES_ANALYTICS_DATABASE!;

      this.pool = new Pool({
        host: process.env.POSTGRES_HOST!,
        port: parseInt(process.env.POSTGRES_PORT!),
        user: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_PASSWORD!,
        database: dbName,

        // Connection pool configuration
        max: parseInt(process.env.POSTGRES_POOL_MAX || "10"),
        idleTimeoutMillis: parseInt(
          process.env.POSTGRES_IDLE_TIMEOUT || "30000"
        ),
        connectionTimeoutMillis: parseInt(
          process.env.POSTGRES_CONNECTION_TIMEOUT || "2000"
        ),
        maxUses: parseInt(process.env.POSTGRES_MAX_USES || "7500"),

        // SSL configuration
        ssl:
          process.env.NODE_ENV === "production"
            ? {
                rejectUnauthorized:
                  process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED === "true",
                ca: process.env.POSTGRES_SSL_CA,
                key: process.env.POSTGRES_SSL_KEY,
                cert: process.env.POSTGRES_SSL_CERT,
              }
            : false,
      });

      // Test connection
      const client = await this.pool.connect();
      try {
        await client.query("SELECT 1");
        console.log(
          `✅ PostgreSQL ${this.dbType} connection pool established for ${dbName} (max connections: ${this.pool.options.max})`
        );
      } finally {
        client.release();
      }
    }
  }

  public static async closeAllConnections(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    if (PostgresDatabaseService.mainInstance) {
      closePromises.push(
        PostgresDatabaseService.mainInstance.closeConnection()
      );
    }

    if (PostgresDatabaseService.analyticsInstance) {
      closePromises.push(
        PostgresDatabaseService.analyticsInstance.closeConnection()
      );
    }

    await Promise.all(closePromises);
    console.log("All PostgreSQL connection pools closed");
  }

  // ... rest of the implementation remains the same
}
```

---

## Repository Patterns

### Simple Repository Pattern

```typescript
// For basic CRUD operations
export class UserRepoImpl implements IUserRepository {
  private readonly tableName = "users";

  constructor(private readonly databaseService: IDatabaseService) {}

  async create(params: TCreateUserParams): Promise<User> {
    const query = `
      INSERT INTO ${this.tableName} (id, email, first_name, last_name, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      IdGeneratorService.getInstance().generateUUID(),
      params.email,
      params.firstName,
      params.lastName,
      params.status,
    ];

    const result = await this.databaseService.insert<TUserRecord>(
      query,
      values,
      "createUser"
    );
    return User.create(result[0]);
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [id],
      "findUserById"
    );
    return result[0] ? User.create(result[0]) : null;
  }
}
```

### Complex Repository Pattern with Transactions

```typescript
// For complex operations with logging and transactions
export class OrderRepoImpl implements IOrderRepository {
  private readonly tableName = "orders";

  constructor(
    private readonly databaseService: IDatabaseService,
    private readonly logger: ILoggerService
  ) {}

  async createWithItems(
    orderParams: TCreateOrderParams,
    itemsParams: TCreateOrderItemParams[]
  ): Promise<Order> {
    this.logger.info("Creating order with items", {
      userId: orderParams.userId,
      itemsCount: itemsParams.length,
    });

    try {
      return await this.databaseService.withTransaction!(async (client) => {
        // Create order
        const orderQuery = `
          INSERT INTO ${this.tableName} (id, user_id, status, total, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING *
        `;

        const orderId = IdGeneratorService.getInstance().generateUUID();
        const orderValues = [
          orderId,
          orderParams.userId,
          orderParams.status,
          orderParams.total,
        ];

        const orderResult = await client.query(orderQuery, orderValues);
        const order = Order.create(orderResult.rows[0]);

        // Create order items
        for (const itemParams of itemsParams) {
          const itemQuery = `
            INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          `;

          const itemValues = [
            IdGeneratorService.getInstance().generateUUID(),
            orderId,
            itemParams.productId,
            itemParams.quantity,
            itemParams.price,
          ];

          await client.query(itemQuery, itemValues);
        }

        this.logger.info("Order created successfully", { orderId: order.id });
        return order;
      });
    } catch (error) {
      this.logger.error("Failed to create order with items", {
        error,
        userId: orderParams.userId,
      });
      throw error;
    }
  }

  async findWithItems(id: string): Promise<Order | null> {
    const query = `
      SELECT
        o.*,
        oi.id as item_id,
        oi.product_id,
        oi.quantity,
        oi.price as item_price
      FROM ${this.tableName} o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1 AND o.deleted_at IS NULL
    `;

    const result = await this.databaseService.select<any>(
      query,
      [id],
      "findOrderWithItems"
    );

    if (result.length === 0) {
      return null;
    }

    // Transform flat result into order with items
    const orderData = result[0];
    const items = result
      .filter((row) => row.item_id)
      .map((row) => ({
        id: row.item_id,
        productId: row.product_id,
        quantity: row.quantity,
        price: row.item_price,
      }));

    return Order.createWithItems(orderData, items);
  }
}
```

### Repository with Caching

```typescript
// Repository with Redis caching
export class CachedUserRepoImpl implements IUserRepository {
  private readonly tableName = "users";
  private readonly cachePrefix = "user:";
  private readonly cacheTTL = 3600; // 1 hour

  constructor(
    private readonly databaseService: IDatabaseService,
    private readonly cacheService: ICacheService,
    private readonly logger: ILoggerService
  ) {}

  async findById(id: string): Promise<User | null> {
    const cacheKey = `${this.cachePrefix}${id}`;

    try {
      // Try cache first
      const cached = await this.cacheService.get<TUserRecord>(cacheKey);
      if (cached) {
        this.logger.debug("User found in cache", { userId: id });
        return User.create(cached);
      }
    } catch (error) {
      this.logger.warn("Cache lookup failed", { error, userId: id });
    }

    // Fallback to database
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [id],
      "findUserById"
    );

    if (result[0]) {
      const user = User.create(result[0]);

      // Cache the result
      try {
        await this.cacheService.set(cacheKey, result[0], this.cacheTTL);
        this.logger.debug("User cached", { userId: id });
      } catch (error) {
        this.logger.warn("Failed to cache user", { error, userId: id });
      }

      return user;
    }

    return null;
  }

  async update(id: string, params: TUpdateUserParams): Promise<User> {
    const query = `
      UPDATE ${this.tableName}
      SET first_name = $2, last_name = $3, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await this.databaseService.update<TUserRecord>(
      query,
      [id, params.firstName, params.lastName],
      "updateUser"
    );

    if (!result[0]) {
      throw new Error("User not found");
    }

    const user = User.create(result[0]);

    // Invalidate cache
    const cacheKey = `${this.cachePrefix}${id}`;
    try {
      await this.cacheService.delete(cacheKey);
      this.logger.debug("User cache invalidated", { userId: id });
    } catch (error) {
      this.logger.warn("Failed to invalidate user cache", {
        error,
        userId: id,
      });
    }

    return user;
  }
}
```

---

## Migration Management

### Migration Interface

```typescript
// src/shared/core/interfaces/services/migrationService.ts
export interface IMigrationService {
  runMigrations(): Promise<void>;
  createMigration(name: string, sql: string): Promise<void>;
  rollbackMigration(version: string): Promise<void>;
  getMigrationStatus(): Promise<TMigrationStatus[]>;
}

export type TMigrationStatus = {
  version: string;
  name: string;
  executedAt: Date | null;
  status: "pending" | "completed" | "failed";
};
```

### PostgreSQL Migration Service

```typescript
// src/infrastructure/externalServices/database/postgresMigrationService.ts
import {
  IMigrationService,
  TMigrationStatus,
} from "../../../shared/core/interfaces/services/migrationService";
import { IDatabaseService } from "../../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../../shared/core/interfaces/services/loggerService";
import * as fs from "fs";
import * as path from "path";

export class PostgresMigrationService implements IMigrationService {
  private readonly migrationsDir = path.join(process.cwd(), "migrations");
  private readonly migrationsTable = "schema_migrations";

  constructor(
    private readonly databaseService: IDatabaseService,
    private readonly logger: ILoggerService
  ) {}

  async runMigrations(): Promise<void> {
    this.logger.info("Starting PostgreSQL database migrations");

    // Ensure migrations table exists
    await this.ensureMigrationsTable();

    // Get pending migrations
    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      this.logger.info("No pending migrations");
      return;
    }

    this.logger.info(`Running ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      await this.runSingleMigration(migration);
    }

    this.logger.info("All migrations completed successfully");
  }

  private async ensureMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(255)
      )
    `;

    await this.databaseService.executeQuery(query, [], "ensureMigrationsTable");
  }

  private async getPendingMigrations(): Promise<TMigrationFile[]> {
    // Read migration files
    const migrationFiles = fs
      .readdirSync(this.migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()
      .map((file) => {
        const version = file.split("_")[0];
        const name = file.replace(".sql", "").substring(version.length + 1);
        return {
          version,
          name,
          filename: file,
          filepath: path.join(this.migrationsDir, file),
        };
      });

    // Get executed migrations
    const executedQuery = `SELECT version FROM ${this.migrationsTable}`;
    const executedMigrations = await this.databaseService.select<{
      version: string;
    }>(executedQuery, [], "getExecutedMigrations");

    const executedVersions = new Set(executedMigrations.map((m) => m.version));

    // Return pending migrations
    return migrationFiles.filter(
      (migration) => !executedVersions.has(migration.version)
    );
  }

  private async runSingleMigration(migration: TMigrationFile): Promise<void> {
    this.logger.info(
      `Running migration: ${migration.version}_${migration.name}`
    );

    try {
      // Read migration SQL
      const sql = fs.readFileSync(migration.filepath, "utf8");

      // Calculate checksum
      const checksum = this.calculateChecksum(sql);

      // Execute migration
      await this.databaseService.executeQuery(
        sql,
        [],
        `migration_${migration.version}`
      );

      // Record migration
      const recordQuery = `
        INSERT INTO ${this.migrationsTable} (version, name, executed_at, checksum)
        VALUES ($1, $2, NOW(), $3)
      `;

      await this.databaseService.insert(
        recordQuery,
        [migration.version, migration.name, checksum],
        "recordMigration"
      );

      this.logger.info(
        `Migration completed: ${migration.version}_${migration.name}`
      );
    } catch (error) {
      this.logger.error(
        `Migration failed: ${migration.version}_${migration.name}`,
        { error }
      );
      throw error;
    }
  }

  async createMigration(name: string, sql: string): Promise<void> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .split(".")[0];
    const filename = `${timestamp}_${name
      .replace(/\s+/g, "_")
      .toLowerCase()}.sql`;
    const filepath = path.join(this.migrationsDir, filename);

    // Ensure migrations directory exists
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
    }

    // Write migration file
    fs.writeFileSync(filepath, sql);

    this.logger.info(`Migration created: ${filename}`);
  }

  async rollbackMigration(version: string): Promise<void> {
    this.logger.info(`Rolling back migration: ${version}`);

    try {
      // Remove migration record
      const query = `DELETE FROM ${this.migrationsTable} WHERE version = $1`;
      await this.databaseService.delete(query, [version], "rollbackMigration");

      this.logger.info(`Migration rolled back: ${version}`);
    } catch (error) {
      this.logger.error(`Migration rollback failed: ${version}`, { error });
      throw error;
    }
  }

  async getMigrationStatus(): Promise<TMigrationStatus[]> {
    // Get all migration files
    const migrationFiles = fs
      .readdirSync(this.migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()
      .map((file) => {
        const version = file.split("_")[0];
        const name = file.replace(".sql", "").substring(version.length + 1);
        return { version, name };
      });

    // Get executed migrations
    const executedQuery = `
      SELECT version, name, executed_at
      FROM ${this.migrationsTable}
      ORDER BY version
    `;
    const executedMigrations = await this.databaseService.select<{
      version: string;
      name: string;
      executed_at: Date;
    }>(executedQuery, [], "getMigrationStatus");

    const executedMap = new Map(
      executedMigrations.map((m) => [
        m.version,
        { name: m.name, executedAt: m.executed_at },
      ])
    );

    // Combine file and execution status
    return migrationFiles.map((file) => ({
      version: file.version,
      name: file.name,
      executedAt: executedMap.get(file.version)?.executedAt || null,
      status: executedMap.has(file.version) ? "completed" : "pending",
    }));
  }

  private calculateChecksum(content: string): string {
    // Simple checksum calculation (use crypto for production)
    return Buffer.from(content).toString("base64").substring(0, 32);
  }
}

type TMigrationFile = {
  version: string;
  name: string;
  filename: string;
  filepath: string;
};
```

### Migration Examples

```sql
-- migrations/20241201120000_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

```sql
-- migrations/20241201130000_create_orders_table.sql
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create triggers
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Performance Optimization

### Connection Pooling Configuration

```typescript
// Optimized PostgreSQL connection pool
const poolConfig = {
  // Connection limits
  max: parseInt(process.env.POSTGRES_POOL_MAX || "20"), // Max connections
  min: parseInt(process.env.POSTGRES_POOL_MIN || "5"), // Min connections

  // Timeouts
  idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || "30000"), // 30s
  connectionTimeoutMillis: parseInt(
    process.env.POSTGRES_CONNECTION_TIMEOUT || "2000"
  ), // 2s
  acquireTimeoutMillis: parseInt(
    process.env.POSTGRES_ACQUIRE_TIMEOUT || "60000"
  ), // 60s

  // Connection lifecycle
  maxUses: parseInt(process.env.POSTGRES_MAX_USES || "7500"), // Recycle connections

  // Health checks
  allowExitOnIdle: true,

  // SSL for production
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
          ca: process.env.POSTGRES_SSL_CA,
          key: process.env.POSTGRES_SSL_KEY,
          cert: process.env.POSTGRES_SSL_CERT,
        }
      : false,
};
```

### Query Optimization

```typescript
// Optimized repository with query hints
export class OptimizedUserRepoImpl implements IUserRepository {
  async findActiveUsersWithPagination(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ users: User[]; total: number }> {
    // Use EXPLAIN ANALYZE in development
    const explainPrefix =
      process.env.NODE_ENV === "development" ? "EXPLAIN ANALYZE " : "";

    // Optimized query with proper indexing
    const usersQuery = `
      ${explainPrefix}
      SELECT * FROM users
      WHERE status = 'active' AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM users
      WHERE status = 'active' AND deleted_at IS NULL
    `;

    // Execute queries in parallel
    const [usersResult, countResult] = await Promise.all([
      this.databaseService.select<TUserRecord>(
        usersQuery,
        [limit, offset],
        "findActiveUsers"
      ),
      this.databaseService.select<{ total: string }>(
        countQuery,
        [],
        "countActiveUsers"
      ),
    ]);

    return {
      users: usersResult.map((record) => User.create(record)),
      total: parseInt(countResult[0].total),
    };
  }

  // Batch operations for better performance
  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];

    // Use ANY for efficient IN query
    const query = `
      SELECT * FROM users
      WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const result = await this.databaseService.select<TUserRecord>(
      query,
      [ids],
      "findUsersByIds"
    );

    return result.map((record) => User.create(record));
  }
}
```

### Database Monitoring

```typescript
// PostgreSQL performance monitoring
export class PostgreSQLMonitoringService {
  constructor(
    private readonly databaseService: IDatabaseService,
    private readonly logger: ILoggerService
  ) {}

  async getConnectionPoolStats(): Promise<TConnectionPoolStats> {
    const query = `
      SELECT
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    const result = await this.databaseService.select<TConnectionPoolStats>(
      query,
      [],
      "getConnectionPoolStats"
    );

    return result[0];
  }

  async getSlowQueries(minDuration: number = 1000): Promise<TSlowQuery[]> {
    const query = `
      SELECT
        query,
        mean_exec_time,
        calls,
        total_exec_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements
      WHERE mean_exec_time > $1
      ORDER BY mean_exec_time DESC
      LIMIT 10
    `;

    return await this.databaseService.select<TSlowQuery>(
      query,
      [minDuration],
      "getSlowQueries"
    );
  }

  async getTableSizes(): Promise<TTableSize[]> {
    const query = `
      SELECT
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_stats
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;

    return await this.databaseService.select<TTableSize>(
      query,
      [],
      "getTableSizes"
    );
  }

  async getDatabaseSize(): Promise<string> {
    const query = `
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;

    const result = await this.databaseService.select<{ size: string }>(
      query,
      [],
      "getDatabaseSize"
    );

    return result[0].size;
  }

  async getIndexUsage(): Promise<TIndexUsage[]> {
    const query = `
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        idx_scan
      FROM pg_stat_user_indexes
      ORDER BY idx_scan DESC
    `;

    return await this.databaseService.select<TIndexUsage>(
      query,
      [],
      "getIndexUsage"
    );
  }
}

type TConnectionPoolStats = {
  total_connections: number;
  active_connections: number;
  idle_connections: number;
  idle_in_transaction: number;
};

type TSlowQuery = {
  query: string;
  mean_exec_time: number;
  calls: number;
  total_exec_time: number;
  rows: number;
  hit_percent: number;
};

type TTableSize = {
  schemaname: string;
  tablename: string;
  attname: string;
  n_distinct: number;
  correlation: number;
  size: string;
};

type TIndexUsage = {
  schemaname: string;
  tablename: string;
  indexname: string;
  idx_tup_read: number;
  idx_tup_fetch: number;
  idx_scan: number;
};
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Connection Pool Exhaustion

```typescript
// Monitor and handle pool exhaustion
export class PoolMonitoringService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        if (this.isPoolExhaustionError(error)) {
          this.logger.warn(
            `Pool exhaustion detected, attempt ${attempt}/${this.maxRetries}`,
            {
              context,
              error: error.message,
            }
          );

          if (attempt < this.maxRetries) {
            await this.delay(this.retryDelay * attempt);
            continue;
          }
        }

        throw error;
      }
    }

    throw lastError!;
  }

  private isPoolExhaustionError(error: Error): boolean {
    return (
      error.message.includes("pool") &&
      (error.message.includes("timeout") || error.message.includes("exhausted"))
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

#### 2. Connection Leaks

```typescript
// Connection leak detection
export class ConnectionLeakDetector {
  private readonly connectionTracker = new Map<string, TConnectionInfo>();

  trackConnection(connectionId: string, context: string): void {
    this.connectionTracker.set(connectionId, {
      context,
      createdAt: new Date(),
      stackTrace: new Error().stack || "",
    });
  }

  releaseConnection(connectionId: string): void {
    this.connectionTracker.delete(connectionId);
  }

  detectLeaks(): TConnectionLeak[] {
    const now = new Date();
    const leakThreshold = 30000; // 30 seconds
    const leaks: TConnectionLeak[] = [];

    for (const [connectionId, info] of this.connectionTracker.entries()) {
      const age = now.getTime() - info.createdAt.getTime();
      if (age > leakThreshold) {
        leaks.push({
          connectionId,
          context: info.context,
          age,
          stackTrace: info.stackTrace,
        });
      }
    }

    return leaks;
  }
}

type TConnectionInfo = {
  context: string;
  createdAt: Date;
  stackTrace: string;
};

type TConnectionLeak = {
  connectionId: string;
  context: string;
  age: number;
  stackTrace: string;
};
```

#### 3. Query Performance Issues

```typescript
// PostgreSQL query performance analyzer
export class PostgreSQLQueryAnalyzer {
  private readonly slowQueryThreshold = 1000; // 1 second

  async analyzeQuery(
    query: string,
    values?: unknown[],
    executionTime?: number
  ): Promise<TQueryAnalysis> {
    const analysis: TQueryAnalysis = {
      query,
      executionTime: executionTime || 0,
      isSlow: (executionTime || 0) > this.slowQueryThreshold,
      suggestions: [],
    };

    // Analyze PostgreSQL-specific patterns
    if (query.toLowerCase().includes("select *")) {
      analysis.suggestions.push("Avoid SELECT *, specify needed columns");
    }

    if (query.toLowerCase().includes("like '%")) {
      analysis.suggestions.push(
        "Leading wildcard LIKE queries cannot use indexes"
      );
    }

    if (
      !query.toLowerCase().includes("limit") &&
      query.toLowerCase().includes("select")
    ) {
      analysis.suggestions.push("Consider adding LIMIT for large result sets");
    }

    if (
      query.toLowerCase().includes("order by") &&
      !query.toLowerCase().includes("limit")
    ) {
      analysis.suggestions.push("ORDER BY without LIMIT can be expensive");
    }

    // Check for N+1 query patterns
    if (this.isLikelyNPlusOneQuery(query)) {
      analysis.suggestions.push(
        "Possible N+1 query detected, consider batch loading"
      );
    }

    // PostgreSQL-specific optimizations
    if (query.toLowerCase().includes("in (") && values && values.length > 100) {
      analysis.suggestions.push(
        "Large IN clauses are slow, consider using ANY() with arrays"
      );
    }

    if (query.toLowerCase().includes("exists (")) {
      analysis.suggestions.push(
        "Consider using JOIN instead of EXISTS for better performance"
      );
    }

    return analysis;
  }

  private isLikelyNPlusOneQuery(query: string): boolean {
    // Simple heuristic for N+1 detection
    return (
      query.toLowerCase().includes("where id = $1") ||
      query.toLowerCase().includes("where user_id = $1")
    );
  }
}

type TQueryAnalysis = {
  query: string;
  executionTime: number;
  isSlow: boolean;
  suggestions: string[];
};
```

### Health Check Endpoint

```typescript
// PostgreSQL health check
export class PostgreSQLHealthCheck {
  constructor(private readonly databaseService: IDatabaseService) {}

  async checkHealth(): Promise<THealthCheckResult> {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      const isConnected = this.databaseService.isConnected();
      if (!isConnected) {
        return {
          status: "unhealthy",
          error: "Not connected",
          responseTime: Date.now() - startTime,
        };
      }

      // Test query execution
      await this.databaseService.select(
        "SELECT 1 as health_check",
        [],
        "healthCheck"
      );

      // Test database-specific functionality
      const dbInfo = await this.getDatabaseInfo();

      return {
        status: "healthy",
        responseTime: Date.now() - startTime,
        info: this.databaseService.getConnectionInfo(),
        databaseInfo: dbInfo,
      };
    } catch (error: any) {
      return {
        status: "unhealthy",
        error: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async getDatabaseInfo(): Promise<TDatabaseInfo> {
    const versionQuery = "SELECT version() as version";
    const sizeQuery =
      "SELECT pg_size_pretty(pg_database_size(current_database())) as size";

    const [versionResult, sizeResult] = await Promise.all([
      this.databaseService.select<{ version: string }>(
        versionQuery,
        [],
        "getVersion"
      ),
      this.databaseService.select<{ size: string }>(sizeQuery, [], "getSize"),
    ]);

    return {
      version: versionResult[0].version,
      size: sizeResult[0].size,
    };
  }
}

type THealthCheckResult = {
  status: "healthy" | "unhealthy";
  responseTime: number;
  error?: string;
  info?: string;
  databaseInfo?: TDatabaseInfo;
};

type TDatabaseInfo = {
  version: string;
  size: string;
};
```

---

## Conclusion

This comprehensive PostgreSQL implementation guide provides:

### ✅ **Complete PostgreSQL Implementation**

- Interface-based PostgreSQL service
- Connection pooling and management
- Repository patterns (simple, complex, cached)
- Transaction support

### ✅ **Production-Ready Features**

- Environment validation
- Error handling and retry logic
- Performance monitoring
- Health checks
- Migration management

### ✅ **Testing Strategies**

- Unit tests for repositories
- Integration tests for APIs
- Database test setup and cleanup
- Mock strategies

### ✅ **Performance Optimization**

- Connection pool tuning
- Query optimization
- Batch operations
- PostgreSQL-specific optimizations

### ✅ **Troubleshooting Tools**

- Connection leak detection
- Query performance analysis
- Pool monitoring
- PostgreSQL-specific health checks

This guide ensures that PostgreSQL implementations follow Clean Architecture principles while providing robust, scalable, and maintainable database integration for TypeScript projects.
