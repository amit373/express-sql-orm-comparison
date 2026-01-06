import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import config from "@packages/config";
import logger from "@packages/logger";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.database.url,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  ssl:
    config.env === "production"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

// Initialize drizzle ORM with the connection pool
export const db = drizzle(pool);

// Initialize and verify database connection
export const initializeDatabase = async () => {
  try {
    // Test the connection by running a simple query
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    logger.info("Drizzle database connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};
