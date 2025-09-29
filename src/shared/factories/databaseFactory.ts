import { EConnectionTypes } from "../infrastructure/config/database";
import {
  DatabaseService,
  PostgreSQLDatabaseService,
} from "../infrastructure/services/databaseService";
import { LoggerFactory } from "./logger-factory";

// Database factory following Clean Architecture patterns
export class DatabaseFactory {
  private static instances: Map<EConnectionTypes, DatabaseService> = new Map();

  // Get or create database service instance (singleton pattern per connection type)
  static getDatabase(connectionType: EConnectionTypes): DatabaseService {
    if (!this.instances.has(connectionType)) {
      const dbService = new PostgreSQLDatabaseService(connectionType);
      this.instances.set(connectionType, dbService);
    }

    return this.instances.get(connectionType)!;
  }

  // Create database service instance (for dependency injection)
  static create(): DatabaseService {
    return this.getMainDatabase();
  }

  // Get main database connection
  static getMainDatabase(): DatabaseService {
    return this.getDatabase(EConnectionTypes.main);
  }

  // Get logs database connection
  static getLogsDatabase(): DatabaseService {
    return this.getDatabase(EConnectionTypes.logs);
  }

  // Test all database connections
  static async testConnections(): Promise<{ [key: string]: boolean }> {
    const logger = LoggerFactory.getInstance();
    const results: { [key: string]: boolean } = {};

    // Test main database
    try {
      logger.info("Testing main database connection");
      const mainDb = this.getMainDatabase();
      results[`postgresql_${EConnectionTypes.main}`] = await mainDb.ping();
      logger.info("Main database connection test completed", {
        success: results[`postgresql_${EConnectionTypes.main}`],
      });
    } catch (error) {
      logger.error("Main database connection test failed", error as Error);
      results[`postgresql_${EConnectionTypes.main}`] = false;
    }

    // Test logs database
    try {
      logger.info("Testing logs database connection");
      const logsDb = this.getLogsDatabase();
      results[`postgresql_${EConnectionTypes.logs}`] = await logsDb.ping();
      logger.info("Logs database connection test completed", {
        success: results[`postgresql_${EConnectionTypes.logs}`],
      });
    } catch (error) {
      logger.error("Logs database connection test failed", error as Error);
      results[`postgresql_${EConnectionTypes.logs}`] = false;
    }

    return results;
  }

  // Close all database connections
  static async closeAllConnections(): Promise<void> {
    const logger = LoggerFactory.getInstance();
    const promises: Promise<void>[] = [];

    for (const [connectionType, dbService] of this.instances) {
      logger.info(`Closing database connection: ${connectionType}`);
      promises.push(dbService.end());
    }

    await Promise.all(promises);
    this.instances.clear();
    logger.info("All database connections closed");
  }

  // Get connection health information
  static async getConnectionHealth(): Promise<any> {
    const health: any = {
      timestamp: new Date().toISOString(),
      connections: {},
    };

    for (const [connectionType, dbService] of this.instances) {
      try {
        const isHealthy = await dbService.ping();
        health.connections[connectionType] = {
          status: isHealthy ? "healthy" : "unhealthy",
          // Get pool stats if available
          ...(dbService instanceof PostgreSQLDatabaseService && {
            poolStats: dbService.getPoolStats(),
          }),
        };
      } catch (error) {
        health.connections[connectionType] = {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return health;
  }
}
