// Database connection types enum following Clean Architecture guide
export enum EConnectionTypes {
  main = "main", // Main application database
  logs = "logs", // Application logs database
  cache = "cache", // Redis cache connection
  search = "search", // Elasticsearch connection
}

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeoutMillis?: number;
}

// Application database configuration
export interface AppDatabaseConfig {
  [EConnectionTypes.main]: DatabaseConfig;
  [EConnectionTypes.logs]: DatabaseConfig;
}

// Get database configuration from environment
export const getDatabaseConfig = (): AppDatabaseConfig => {
  // Determine if SSL is required (Aiven cloud requires SSL)
  const isCloudDatabase = process.env["DB_HOST"]?.includes("aivencloud.com");
  const requireSSL =
    isCloudDatabase || process.env["NODE_ENV"] === "production";

  return {
    [EConnectionTypes.main]: {
      host: process.env["DB_HOST"] || "localhost",
      port: parseInt(process.env["DB_PORT"] || "5432"),
      database: process.env["DB_NAME"] || "ecommerce_main",
      username: process.env["DB_USER"] || "postgres",
      password: process.env["DB_PASSWORD"] || "password",
      ssl: requireSSL,
      maxConnections: parseInt(process.env["DB_MAX_CONNECTIONS"] || "20"),
      idleTimeoutMillis: parseInt(process.env["DB_IDLE_TIMEOUT"] || "30000"),
    },
    [EConnectionTypes.logs]: {
      host:
        process.env["DB_LOGS_HOST"] || process.env["DB_HOST"] || "localhost",
      port: parseInt(
        process.env["DB_LOGS_PORT"] || process.env["DB_PORT"] || "5432"
      ),
      database:
        process.env["DB_LOGS_NAME"] ||
        process.env["DB_NAME"] ||
        "ecommerce_logs",
      username:
        process.env["DB_LOGS_USER"] || process.env["DB_USER"] || "postgres",
      password:
        process.env["DB_LOGS_PASSWORD"] ||
        process.env["DB_PASSWORD"] ||
        "password",
      ssl: requireSSL,
      maxConnections: parseInt(process.env["DB_LOGS_MAX_CONNECTIONS"] || "10"),
      idleTimeoutMillis: parseInt(
        process.env["DB_LOGS_IDLE_TIMEOUT"] || "30000"
      ),
    },
  };
};
