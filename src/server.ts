import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DatabaseFactory } from "./shared/factories/databaseFactory";
import { moduleRoutes } from "./modules";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

// Clean Architecture Module Routes
app.use(moduleRoutes);

// Basic route

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
