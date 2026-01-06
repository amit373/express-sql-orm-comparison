import { sequelize } from "../config/database";
import { User } from "../models/User";
import { UserRole } from "@packages/types";
import bcrypt from "bcryptjs";

export const seed = async () => {
  try {
    await sequelize.sync();

    const password = await bcrypt.hash("password123", 10);

    const users = [
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password,
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        firstName: "Manager",
        lastName: "User",
        email: "manager@example.com",
        password,
        role: UserRole.MANAGER,
        isActive: true,
      },
      {
        firstName: "Regular",
        lastName: "User",
        email: "user@example.com",
        password,
        role: UserRole.USER,
        isActive: true,
      },
    ];

    for (const userData of users) {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (!existing) {
        // @ts-ignore
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
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
