import { Model } from "objection";
import { User, UserRole } from "@packages/types";
import { User as UserModel } from "../models/User";

export class UserRepository {
  async create(userData: Partial<User>): Promise<User> {
    const user = await UserModel.query().insert({
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName,
      password: userData.password!, // In a real implementation, this should be hashed
      role: userData.role || UserRole.USER,
      isActive: userData.isActive ?? true,
    });

    return {
      ...user,
      lastName: user.lastName || undefined,
    } as unknown as User;
  }

  async findById(id: number): Promise<User | null> {
    const dbUser = await UserModel.query().findById(id);
    if (!dbUser) return null;
    return {
      ...dbUser,
      lastName: dbUser.lastName || undefined,
    } as unknown as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const dbUser = await UserModel.query().where("email", email).first();
    if (!dbUser) return null;
    return {
      ...dbUser,
      lastName: dbUser.lastName || undefined,
    } as unknown as User;
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await UserModel.query().patchAndFetchById(
      id,
      userData as Partial<UserModel>,
    );
    if (!user) {
      throw new Error("User not found");
    }

    return {
      ...user,
      lastName: user.lastName || undefined,
    } as unknown as User;
  }

  async delete(id: number): Promise<void> {
    await UserModel.query().deleteById(id);
  }
}
