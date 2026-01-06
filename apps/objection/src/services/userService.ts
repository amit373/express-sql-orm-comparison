import { User as ObjectionUser } from "../models/User";
import { User, UserRole } from "@packages/types";
import { BadRequestException, NotFoundException } from "@packages/common";

export interface IUserService {
  createUser(userData: Partial<User>): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
}

export class UserService implements IUserService {
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      // Validate required fields
      if (!userData.email || !userData.firstName) {
        throw new BadRequestException("Email and firstName are required");
      }

      // Check if user already exists
      const existingUser = await ObjectionUser.query()
        .where("email", userData.email)
        .first();
      if (existingUser) {
        throw new BadRequestException("User with this email already exists");
      }

      // Create user
      const user = await ObjectionUser.query().insert({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName || "",
        password: userData.password!, // We assume password is there or we should have validated it
        isActive: userData.isActive ?? true,
        role: userData.role || UserRole.USER,
      });

      return user as unknown as User;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await ObjectionUser.query()
        .findById(id)
        .where("isActive", true);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user as unknown as User;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await ObjectionUser.query()
        .where("isActive", true)
        .orderBy("createdAt", "DESC");
      return users as unknown as User[];
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await ObjectionUser.query().findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Update user
      const updatedUser = await ObjectionUser.query().patchAndFetchById(
        id,
        userData,
      );
      return updatedUser as unknown as User;
    } catch (error) {
      throw error;
    }
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    try {
      const existingUser = await ObjectionUser.query().findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const updatedUser = await ObjectionUser.query().patchAndFetchById(id, {
        role,
      } as any);
      return updatedUser as unknown as User;
    } catch (error) {
      throw error;
    }
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User> {
    try {
      const existingUser = await ObjectionUser.query().findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const updatedUser = await ObjectionUser.query().patchAndFetchById(id, {
        isActive,
      });
      return updatedUser as unknown as User;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await ObjectionUser.query().findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Soft delete user
      await ObjectionUser.query().patchAndFetchById(id, { isActive: false });
      return true;
    } catch (error) {
      throw error;
    }
  }
}
