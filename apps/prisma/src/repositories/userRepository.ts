import { User as PrismaUser } from "@prisma/client";
import { User, UserRole } from "@packages/types";
import { prisma } from "../config/database";

export class UserRepository {
  async create(userData: Partial<User>): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName || "",
        password: userData.password!,
        isActive: userData.isActive ?? true,
        role: (userData.role as string) || "USER",
      },
    });

    return this.mapToUser(user);
  }

  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToUser(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { isActive: true },
    });

    return users.map((user) => this.mapToUser(user));
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    // Filter out undefined values to avoid overwriting with null/undefined if not intended
    // But Prisma handles undefined by ignoring it in update usually.
    // However, we need to map types correctly.

    const dataToUpdate: any = { ...userData };
    if (userData.role) {
      dataToUpdate.role = userData.role as string;
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.mapToUser(user);
  }

  async delete(id: number): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { isActive: false }, // Soft delete
    });
  }

  private mapToUser(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName || "",
      password: prismaUser.password,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      role: prismaUser.role as UserRole,
    };
  }
}
