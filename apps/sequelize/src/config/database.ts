import "dotenv/config";
import { Sequelize } from "sequelize";
import config from "@packages/config";
import logger from "@packages/logger";

export const sequelize = new Sequelize(config.database.url, {
  dialect: "postgres",
  logging: config.env === "development" ? logger.debug.bind(logger) : false,
  dialectOptions: {
    ssl:
      config.env === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : undefined,
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Sequelize database connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};
