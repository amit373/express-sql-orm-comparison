import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "@packages/config";
import logger from "@packages/logger";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: config.database.url,
  synchronize: false, // Set to false in production, migrations should be used instead
  logging: config.env === "development",
  entities: [__dirname + "/../entities/**/*{.ts,.js}"],
  migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],
  subscribers: [],
  ssl:
    config.env === "production"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  extra: {
    max: 10, // Connection pool size
    idleTimeoutMillis: 30000,
  },
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("TypeORM database connection has been established successfully.");
  } catch (err) {
    logger.error("Error during Data Source initialization", err);
    process.exit(1);
  }
};
