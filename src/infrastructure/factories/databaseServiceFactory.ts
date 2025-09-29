import { IDatabaseService } from "../../shared/core/interfaces/services/databaseService";
import { ILoggerService } from "../../shared/core/interfaces/loggerService";
import { PostgresDatabaseService } from "../externalServices/database/postgresDatabaseService";

export class DatabaseServiceFactory {
  public static create(logger: ILoggerService): IDatabaseService {
    // For now, return a synchronous instance
    // In production, you might want to handle async initialization differently
    return PostgresDatabaseService.createInstance(logger);
  }

  public static async createPostgresService(
    logger: ILoggerService
  ): Promise<IDatabaseService> {
    return await PostgresDatabaseService.getInstance(logger);
  }

  public static async closeAllConnections(): Promise<void> {
    const postgresInstance = PostgresDatabaseService["instance"];
    if (postgresInstance) {
      await postgresInstance.closeConnection();
    }
    console.log("PostgreSQL connection closed");
  }
}
