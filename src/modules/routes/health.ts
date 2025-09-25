import { Router, Request, Response } from "express";
import { DatabaseFactory } from "../../shared/factories/databaseFactory";

const router = Router();

// Basic health check
router.get("/", async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "E-Commerce Backend API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Database health check
router.get("/database", async (req: Request, res: Response) => {
  try {
    const connectionHealth = await DatabaseFactory.getConnectionHealth();
    const testResults = await DatabaseFactory.testConnections();

    res.json({
      success: true,
      message: "Database health check completed",
      data: {
        ...connectionHealth,
        testResults,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Detailed system health
router.get("/system", async (req: Request, res: Response) => {
  try {
    const connectionHealth = await DatabaseFactory.getConnectionHealth();
    const testResults = await DatabaseFactory.testConnections();

    res.json({
      success: true,
      message: "System health check completed",
      data: {
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version,
          environment: process.env["NODE_ENV"] || "development",
        },
        database: {
          ...connectionHealth,
          testResults,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "System health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as healthRouter };
