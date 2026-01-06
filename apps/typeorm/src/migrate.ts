import { AppDataSource } from "./config/database";

const runMigrations = async () => {
  console.log("Running migrations...");
  try {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    console.log("Migrations completed successfully!");
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
};

runMigrations();

