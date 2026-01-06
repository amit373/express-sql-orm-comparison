import { db } from "../config/database";
import { users } from "../schema/user";
import { tasks } from "../schema/tasks";
import { eq } from "drizzle-orm";
import { UserRole } from "@packages/types";
import bcrypt from "bcryptjs";

export const seed = async () => {
  try {
    console.log("Starting seeding process...");

    const password = await bcrypt.hash("password123", 10);

    const usersData = [
      {
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        password,
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        email: "manager@example.com",
        firstName: "Manager",
        lastName: "User",
        password,
        role: UserRole.MANAGER,
        isActive: true,
      },
      {
        email: "user@example.com",
        firstName: "Regular",
        lastName: "User",
        password,
        role: UserRole.USER,
        isActive: true,
      },
    ];

    for (const userData of usersData) {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values(userData);
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    // Get the created users to use for task creation
    const createdUsers = await db.select().from(users);

    if (createdUsers.length > 0) {
      const adminUser = createdUsers[0];
      if (adminUser) {
        // Additional check to satisfy TypeScript

        const tasksData = [
          {
            title: "Sample Task 1",
            description: "This is a sample task for testing",
            status: "PENDING",
            priority: "HIGH",
            assignedToId: adminUser.id,
            createdBy: adminUser.id,
          },
          {
            title: "Sample Task 2",
            description: "Another sample task for testing",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            assignedToId: adminUser.id,
            createdBy: adminUser.id,
          },
        ];

        for (const taskData of tasksData) {
          // Check if task with this title already exists
          const existingTask = await db
            .select()
            .from(tasks)
            .where(eq(tasks.title, taskData.title))
            .limit(1);

          if (existingTask.length === 0) {
            await db.insert(tasks).values(taskData);
            console.log(`Created task: ${taskData.title}`);
          } else {
            console.log(`Task already exists: ${taskData.title}`);
          }
        }
      }
    }

    console.log("Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
