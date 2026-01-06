import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { UserRole } from "@packages/types";
import bcrypt from "bcryptjs";

export const seed = async () => {
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);

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
      const existing = await userRepository.findOneBy({
        email: userData.email,
      });
      if (!existing) {
        // Need to use save to handle potential hooks or column mapping if any,
        // though create+save is standard typeorm.
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log("Seeding completed successfully");
    await AppDataSource.destroy();
  } catch (error) {
    console.error("Seeding failed:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
};

seed();
