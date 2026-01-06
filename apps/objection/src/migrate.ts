import { knex } from "./config/database";

const runMigrations = async () => {
  console.log("Running migrations...");
  try {
    await knex.migrate.latest();
    console.log("Migrations completed successfully!");
    await knex.destroy();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    await knex.destroy();
    process.exit(1);
  }
};

runMigrations();

