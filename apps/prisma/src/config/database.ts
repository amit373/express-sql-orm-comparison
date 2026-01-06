import { PrismaClient } from "@prisma/client";
import logger from "@packages/logger";

// Create a singleton PrismaClient instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Initialize and verify database connection
export const initializeDatabase = async () => {
  try {
    // Test the connection by running a simple query
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Prisma database connection has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

