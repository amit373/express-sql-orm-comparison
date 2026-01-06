import { getRepository } from "typeorm";
import { User as TypeOrmUser } from "../entities/User";
import { User, UserRole } from "@packages/types";
import { BadRequestException, NotFoundException } from "@packages/common";
import { UserRepository } from "../repositories/userRepository";

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
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      // Validate required fields
      if (!userData.email || !userData.firstName) {
        throw new BadRequestException("Email and firstName are required");
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(
        userData.email,
      );
      if (existingUser) {
        throw new BadRequestException("User with this email already exists");
      }

      // Create user
      const user = await this.userRepository.create(userData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Update user
      const updatedUser = await this.userRepository.update(id, userData);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUserRole(id: number, role: UserRole): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Update user role
      const updatedUser = await this.userRepository.update(id, { role });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Update user status
      const updatedUser = await this.userRepository.update(id, { isActive });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Delete user
      await this.userRepository.delete(id);
      return true;
    } catch (error) {
      throw error;
    }
  }
}
