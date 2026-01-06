import { User as SequelizeUser } from "../models/User";
import { User, UserRole } from "@packages/types";
import { BadRequestException, NotFoundException } from "@packages/common";
import bcrypt from "bcryptjs";

export interface IUserService {
  createUser(userData: Partial<User>): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  updateUserRole(id: number, role: UserRole): Promise<User>;
  updateUserStatus(id: number, isActive: boolean): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
}

export class UserService implements IUserService {
  async createUser(userData: Partial<User>): Promise<User> {
    // Validate required fields
    if (!userData.email || !userData.firstName) {
      throw new BadRequestException("Email and firstName are required");
    }

    // Check if user already exists
    const existingUser = await SequelizeUser.findOne({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    const password = userData.password
      ? await bcrypt.hash(userData.password, 12)
      : await bcrypt.hash("Password123!", 12);

    // Create user
    const user = await SequelizeUser.create({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName || "",
      password: password,
      role: userData.role || UserRole.USER,
      isActive: userData.isActive ?? true,
    } as any);

    return this.mapToUser(user.toJSON());
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await SequelizeUser.findByPk(id);
    if (!user?.isActive) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.mapToUser(user.toJSON());
  }

  async getAllUsers(): Promise<User[]> {
    const users = await SequelizeUser.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    });
    return users.map((user) => this.mapToUser(user.toJSON()));
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // Check if user exists
    const existingUser = await SequelizeUser.findByPk(id);
    if (!existingUser?.isActive) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Update user
    await existingUser.update(userData);
    return this.mapToUser(existingUser.toJSON());
  }

  async updateUserRole(id: number, role: UserRole): Promise<User> {
    // Check if user exists
    const existingUser = await SequelizeUser.findByPk(id);
    if (!existingUser?.isActive) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Update user role
    await existingUser.update({ role: role as any }); // Cast as any because role enum might not match string in model if not defined as enum
    return this.mapToUser(existingUser.toJSON());
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User> {
    // Check if user exists
    const existingUser = await SequelizeUser.findByPk(id);
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Update user status
    await existingUser.update({ isActive });
    return this.mapToUser(existingUser.toJSON());
  }

  async deleteUser(id: number): Promise<boolean> {
    // Check if user exists
    const existingUser = await SequelizeUser.findByPk(id);
    if (!existingUser || !existingUser.isActive) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Soft delete user
    await existingUser.update({ isActive: false });
    return true;
  }

  private mapToUser(sequelizeUser: any): User {
    return {
      id: sequelizeUser.id,
      email: sequelizeUser.email,
      firstName: sequelizeUser.firstName,
      lastName: sequelizeUser.lastName,
      password: sequelizeUser.password,
      role: sequelizeUser.role,
      isActive: sequelizeUser.isActive,
      createdAt: sequelizeUser.createdAt,
      updatedAt: sequelizeUser.updatedAt,
    };
  }
}
