// IMPORTANT: Make sure to import `instrument.ts` at the top of your file.
import "./instrument";

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { DatabaseFactory } from "./shared/factories/databaseFactory";
import { moduleRoutes } from "./modules";
import { sentryApiLogger } from "./shared/middleware/sentry-logging-middleware";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sentry API logging middleware (log all API calls)
app.use(sentryApiLogger);

// Routes

// Clean Architecture Module Routes
app.use(moduleRoutes);

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env["NODE_ENV"] || "development",
  });
});

// Debug Sentry endpoint for testing
app.get("/debug-sentry", function mainHandler(req: Request, res: Response) {
  throw new Error("My first Sentry error!");
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err: Error, req: Request, res: Response, next: any) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  console.error("Unhandled error:", err);
  res.statusCode = 500;
  res.end((res as any).sentry + "\n");
});

const PORT = process.env["PORT"] || 5000;

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log("Received shutdown signal, closing server gracefully...");

  try {
    await DatabaseFactory.closeAllConnections();
    console.log("Database connections closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env["NODE_ENV"] || "development"}`);
  console.log(`🏗️  Architecture: Clean Architecture with TypeScript`);

  // Test database connections on startup
  try {
    console.log("🔍 Testing database connections...");
    const connectionTests = await DatabaseFactory.testConnections();

    for (const [connection, status] of Object.entries(connectionTests)) {
      const emoji = status ? "✅" : "❌";
      console.log(`${emoji} ${connection}: ${status ? "Connected" : "Failed"}`);
    }
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
  }
});

export default app;
