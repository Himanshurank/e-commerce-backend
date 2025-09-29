# ConnectionInitializer Implementation

## Interface

```typescript
// src/shared/core/interfaces/connectionInitializer/connectionInitializer.ts
import { ClickHouseClient } from "@clickhouse/client";

export interface IConnectionInitializer {
  initializeConnection(): Promise<ClickHouseClient>;
  getConnection(): ClickHouseClient;
  closeConnection(): Promise<void>;
}
```

## Implementation

```typescript
// src/shared/connectionInitializer/connectionInitializer.ts
import { ClickHouseClient, createClient } from "@clickhouse/client";
import dotenv from "dotenv";
import { IConnectionInitializer } from "../core/interfaces/connectionInitializer/connectionInitializer";

dotenv.config();

export class ConnectionInitializer implements IConnectionInitializer {
  private static instance: ConnectionInitializer;
  private client: ClickHouseClient | null = null;

  private constructor() {
    // Validate required environment variables
    const requiredEnvVars = [
      "CLICKHOUSE_HOST",
      "CLICKHOUSE_PORT",
      "CLICKHOUSE_DATABASE",
      "CLICKHOUSE_USERNAME",
      "CLICKHOUSE_PASSWORD",
      "CLICKHOUSE_PROTOCOL",
      "CLICKHOUSE_CONNECTION_TIMEOUT",
      "CLICKHOUSE_CONNECTION_LIMIT",
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
    }

    // Validate protocol
    const protocol = process.env.CLICKHOUSE_PROTOCOL;
    if (protocol !== "http" && protocol !== "https") {
      throw new Error('CLICKHOUSE_PROTOCOL must be either "http" or "https"');
    }
  }

  public static getInstance(): ConnectionInitializer {
    if (!ConnectionInitializer.instance) {
      ConnectionInitializer.instance = new ConnectionInitializer();
    }
    return ConnectionInitializer.instance;
  }

  public async initializeConnection(): Promise<ClickHouseClient> {
    if (!this.client) {
      this.client = createClient({
        // Connection details
        host: `${process.env.CLICKHOUSE_PROTOCOL}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
        database: process.env.CLICKHOUSE_DATABASE!,
        username: process.env.CLICKHOUSE_USERNAME!,
        password: process.env.CLICKHOUSE_PASSWORD!,

        // Connection pooling configuration
        max_open_connections: parseInt(process.env.CLICKHOUSE_CONNECTION_LIMIT!),
        request_timeout: parseInt(process.env.CLICKHOUSE_CONNECTION_TIMEOUT!),

        // Keep-alive configuration for connection reuse
        keep_alive: {
          enabled: true,
          socket_ttl: 2500, // Default safe value from ClickHouse client docs
        },
      });

      // Test connection with a real query
      await this.client.query({
        query: "SELECT 1",
        format: "JSONEachRow",
      });

      console.log(
        `✅ ClickHouse connection pool established (max connections: ${process.env.CLICKHOUSE_CONNECTION_LIMIT})`
      );
    }
    return this.client;
  }

  public getConnection(): ClickHouseClient {
    if (!this.client) {
      throw new Error("Connection not initialized. Call initializeConnection() first.");
    }
    return this.client;
  }

  public async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      console.log("ClickHouse connection pool closed");
    }
  }
}
```

## Environment Variables

Required environment variables (all must be set):

```bash
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=9000
CLICKHOUSE_DATABASE=agentclarity
CLICKHOUSE_USERNAME=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_PROTOCOL=http
CLICKHOUSE_CONNECTION_TIMEOUT=30000
CLICKHOUSE_CONNECTION_LIMIT=10
```

## Key Features

- **Singleton Pattern**: Static instance with private constructor
- **Environment Validation**: Validates all required environment variables on construction
- **Connection Pooling**: Configured with max connections and request timeout
- **Connection Testing**: Tests connection with real query instead of ping
- **Keep-Alive**: Optimized for connection reuse
- **Error Handling**: Clear error messages for missing configuration

## Key Patterns

- **Singleton Pattern**: Static instance with private constructor
- **Lazy Initialization**: Connection created only when needed
- **Idempotent Operations**: Safe to call initializeConnection() multiple times
- **Error Propagation**: Throws errors on connection failure

## Dependencies

- `@clickhouse/client` for ClickHouse connectivity
- `dotenv` for environment variable loading

## Integration

```typescript
// Server startup
class Server {
  private connectionInitializer: IConnectionInitializer;

  constructor() {
    this.connectionInitializer = ConnectionInitializer.getInstance();
  }

  async start(): Promise<void> {
    await this.connectionInitializer.initializeConnection();
    this.app.listen(this.port);
  }
}

// Repository usage
class UserRepository {
  private connection: ClickHouseClient;

  constructor() {
    const connectionInitializer = ConnectionInitializer.getInstance();
    this.connection = connectionInitializer.getConnection();
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  const connectionInitializer = ConnectionInitializer.getInstance();
  await connectionInitializer.closeConnection();
  process.exit(0);
});
```

## Testing Mock

```typescript
const mockConnectionInitializer: IConnectionInitializer = {
  async initializeConnection() {
    return mockClickHouseClient;
  },
  getConnection() {
    return mockClickHouseClient;
  },
  async closeConnection() {
    // Mock cleanup
  },
};
```

## Architecture

- **Layer**: Shared Infrastructure Service
- **Pattern**: Singleton for resource management
- **Dependencies**: ClickHouse client library
- **Usage**: Database services and repositories
