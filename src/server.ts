import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DatabaseFactory } from "./shared/factories/databaseFactory";
import { healthRouter } from "./modules/routes/health";
import { testDataRouter } from "./modules/routes/test-data";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/health", healthRouter);
app.use("/api/test", testDataRouter);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "E-Commerce Backend API",
    version: "1.0.0",
    status: "Server is running",
    architecture: "Clean Architecture with TypeScript",
  });
});

// API routes will be added here
app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "E-Commerce API v1",
    endpoints: {
      health: "/health",
      database: "/health/database",
      system: "/health/system",
      testProducts: "/api/test/products",
      testCategories: "/api/test/categories",
      testSearch: "/api/test/search?q=<query>",
    },
  });
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
