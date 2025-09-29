import { createApp } from "./app";
import { LoggerService } from "./shared/services/loggerService";
import { DatabaseServiceFactory } from "./infrastructure/factories/databaseServiceFactory";
import { IDatabaseService } from "./shared/core/interfaces/services/databaseService";

const logger = new LoggerService();
const PORT = process.env.PORT || 3000;

let databaseService: IDatabaseService;

async function startServer() {
  try {
    logger.info("Initializing database connection...");
    databaseService = await DatabaseServiceFactory.createPostgresService(
      logger
    );
    logger.info("Database connection established");

    // Create app with database service
    const app = createApp(databaseService);

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} 🚀`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`Database: ${databaseService.getConnectionInfo()}`);
    });

    return server;
  } catch (error: any) {
    logger.error("❌ Failed to start server", { error: error.message });
    process.exit(1);
  }
}

const serverPromise = startServer();

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  try {
    const server = await serverPromise;

    server.close(async () => {
      logger.info("HTTP server closed");

      try {
        await DatabaseServiceFactory.closeAllConnections();
        logger.info("Database connections closed");
      } catch (error: any) {
        logger.error("Error closing database connections", {
          error: error.message,
        });
      }

      logger.info("Process terminated");
      process.exit(0);
    });
  } catch (error: any) {
    logger.error("Error during graceful shutdown", { error: error.message });
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at Promise", { reason, promise });
  process.exit(1);
});

export default serverPromise;
