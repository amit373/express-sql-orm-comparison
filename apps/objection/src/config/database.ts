import Knex from "knex";
import { Model } from "objection";
import config from "@packages/config";
import logger from "@packages/logger";

// Initialize knex connection
const knex = Knex({
  client: "pg",
  connection: config.database.url,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: __dirname + "/../migrations",
    tableName: "knex_migrations",
  },
  debug: config.env === "development",
});

// Bind all Models to the knex instance
Model.knex(knex);

// Initialize and verify database connection
export const initializeDatabase = async () => {
  try {
    // Test the connection by running a simple query
    await knex.raw("SELECT 1");
    logger.info("Objection database connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

export { knex };
