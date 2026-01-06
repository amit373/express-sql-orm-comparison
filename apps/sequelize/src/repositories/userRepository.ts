import { User, UserRole } from "@packages/types";
import { User as UserModel } from "../models";

export class UserRepository {
  async create(userData: Partial<User>): Promise<User> {
    const user = await UserModel.create({
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName,
      password: userData.password!, // In a real implementation, this should be hashed
      role: userData.role || UserRole.USER,
      isActive: userData.isActive ?? true,
    } as User);

    return user.toJSON();
  }

  async findById(id: number): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    return user ? user.toJSON() : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ where: { email } });
    return user ? user.toJSON() : null;
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }

    await user.update(userData as Partial<UserModel>);
    return user.toJSON();
  }

  async delete(id: number): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }
}
