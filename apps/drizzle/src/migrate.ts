import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./config/database";
import path from "path";

const runMigrations = async () => {
  console.log("Running migrations...");
  try {
    // Use process.cwd() to get the project root, then navigate to migrations
    const migrationsPath = path.resolve(process.cwd(), "src/migrations");
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log("Migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigrations();
