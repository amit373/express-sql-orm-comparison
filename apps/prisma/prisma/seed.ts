import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const users = [
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

  for (const user of users) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existing) {
      await prisma.user.create({
        data: user,
      });
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
