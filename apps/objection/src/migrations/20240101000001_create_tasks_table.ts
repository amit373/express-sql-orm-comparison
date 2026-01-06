import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tasks", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.text("description");
    table.string("status").defaultTo("PENDING");
    table.string("priority").defaultTo("MEDIUM");
    table.integer("assigned_to_id").unsigned().notNullable();
    table.integer("created_by").unsigned().notNullable();
    table.timestamp("completed_at");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.foreign("assigned_to_id").references("id").inTable("users");
    table.foreign("created_by").references("id").inTable("users");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("tasks");
}
