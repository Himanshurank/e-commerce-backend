import dotenv from "dotenv";
import { DatabaseFactory } from "../shared/factories/databaseFactory";
import { EConnectionTypes } from "../shared/infrastructure/config/database";
import { QueryResultRow } from "pg";

// Load environment variables
dotenv.config();

class DropTablesRepository {
  private db: any;

  constructor() {
    this.db = DatabaseFactory.getDatabase(EConnectionTypes.main);
  }

  async getAllTableNames(): Promise<string[]> {
    const query = `
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    const result = await this.db.query(query);
    return result.rows.map((row: { tablename: string }) => row.tablename);
  }

  async getAllCustomTypes(): Promise<string[]> {
    const query = `
      SELECT typname
      FROM pg_type
      WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND typtype = 'e'
      ORDER BY typname;
    `;
    const result = await this.db.query(query);
    return result.rows.map((row: { typname: string }) => row.typname);
  }

  async dropTable(tableName: string): Promise<void> {
    console.log(`🗑️  Dropping table: ${tableName}...`);
    const query = `DROP TABLE IF EXISTS "${tableName}" CASCADE;`;
    await this.db.query(query);
    console.log(`✅ Table ${tableName} dropped.`);
  }

  async dropCustomType(typeName: string): Promise<void> {
    console.log(`🗑️  Dropping custom type: ${typeName}...`);
    const query = `DROP TYPE IF EXISTS "${typeName}" CASCADE;`;
    await this.db.query(query);
    console.log(`✅ Custom type ${typeName} dropped.`);
  }

  async dropFunction(functionName: string): Promise<void> {
    console.log(`🗑️  Dropping function: ${functionName}...`);
    const query = `DROP FUNCTION IF EXISTS ${functionName}() CASCADE;`;
    await this.db.query(query);
    console.log(`✅ Function ${functionName} dropped.`);
  }

  async dropAllTables(): Promise<void> {
    console.log("🚨 Dropping all tables in the database...");

    try {
      const tableNames = await this.getAllTableNames();

      if (tableNames.length === 0) {
        console.log("ℹ️  No tables found to drop.");
        return;
      }

      console.log(`📋 Found ${tableNames.length} tables to drop`);

      // Drop tables in reverse order to handle dependencies, or use CASCADE
      for (const tableName of tableNames) {
        // Exclude internal PostgreSQL tables if any are accidentally fetched
        if (
          !tableName.startsWith("pg_") &&
          !tableName.startsWith("sql_") &&
          !tableName.startsWith("information_schema")
        ) {
          await this.dropTable(tableName);
        }
      }

      console.log("🧹 Dropping custom types...");
      const customTypes = await this.getAllCustomTypes();

      for (const typeName of customTypes) {
        await this.dropCustomType(typeName);
      }

      console.log("🔧 Dropping custom functions...");
      await this.dropFunction("update_updated_at_column");

      console.log("🎉 All tables, types, and functions dropped successfully!");
    } catch (error) {
      console.error("❌ Error during table dropping:", error);
      throw error;
    }
  }
}

async function dropAllTablesScript() {
  console.log("🔄 Starting database cleanup process...");

  const dropRepo = new DropTablesRepository();

  try {
    await dropRepo.dropAllTables();
    console.log("✅ Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Failed to drop all tables:", error);
    throw error;
  } finally {
    await DatabaseFactory.closeAllConnections();
    console.log("🔌 Database connections closed.");
  }
}

// Execute the script
if (require.main === module) {
  dropAllTablesScript()
    .then(() => {
      console.log("🎉 Drop all tables script completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Drop all tables script failed:", error);
      process.exit(1);
    });
}

export { dropAllTablesScript };
