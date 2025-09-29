import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { LoggerService } from "./shared/services/loggerService";
import { IDatabaseService } from "./shared/core/interfaces/services/databaseService";
import { createHomepageRoutes } from "./presentation/routes/homepageRoutes";
import { createAuthRoutes } from "./presentation/routes/authRoutes";

dotenv.config();

// Initialize logger service
const logger = new LoggerService();

function createApp(databaseService: IDatabaseService) {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Logging middleware
  app.use(morgan("combined"));

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/health", (req, res) => {
    logger.debug("Health check requested");
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "e-commerce-backend",
    });
  });

  // Database health check endpoint
  app.get("/health/db", async (req, res) => {
    try {
      const isConnected = databaseService.isConnected();
      const connectionInfo = databaseService.getConnectionInfo();

      res.status(200).json({
        status: isConnected ? "OK" : "ERROR",
        database: "PostgreSQL",
        connection: connectionInfo,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error("Database health check failed", { error: error.message });
      res.status(503).json({
        status: "ERROR",
        database: "PostgreSQL",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // API routes
  app.use("/api/homepage", createHomepageRoutes(databaseService, logger));
  app.use("/api/auth", createAuthRoutes(databaseService, logger));

  // Root endpoint
  app.get("/", (req, res) => {
    logger.info("Root endpoint accessed");
    res.json({
      message: "E-commerce Backend API",
      version: "1.0.0",
      status: "running",
    });
  });

  // Global error handler
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      logger.error("Unhandled error occurred", err);

      res.status(500).json({
        error: "Internal Server Error",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      });
    }
  );

  // 404 handler
  app.use((req: express.Request, res: express.Response) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  return app;
}

export { createApp };
