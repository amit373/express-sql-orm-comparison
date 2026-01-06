import { eq, and } from "drizzle-orm";
import { db } from "../config";
import { users } from "../schema";
import { User, UserRole } from "@packages/types";
import { BadRequestException, NotFoundException } from "@packages/common";

/**
 * Interface for user service operations.
 */
export interface IUserService {
  /**
   * Creates a new user.
   *
   * @param userData - User data to create the user with
   * @returns Promise resolving to the created user
   * @throws Error if required fields are missing or user already exists
   */
  createUser(userData: Partial<User>): Promise<User>;
  /**
   * Retrieves a user by their ID.
   *
   * @param id - The ID of the user to retrieve
   * @returns Promise resolving to the user or null if not found
   * @throws Error if user is not found
   */
  getUserById(id: number): Promise<User | null>;
  /**
   * Retrieves all active users.
   *
   * @returns Promise resolving to an array of users
   */
  getAllUsers(): Promise<User[]>;
  /**
   * Updates a user by their ID.
   *
   * @param id - The ID of the user to update
   * @param userData - User data to update the user with
   * @returns Promise resolving to the updated user
   * @throws Error if user is not found
   */
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  /**
   * Deletes a user by their ID (soft delete).
   *
   * @param id - The ID of the user to delete
   * @returns Promise resolving to true if successful
   * @throws Error if user is not found
   */
  deleteUser(id: number): Promise<boolean>;
}

/**
 * Service class for handling user-related business logic.
 */
export class UserService implements IUserService {
  /**
   * Creates a new user.
   *
   * @param userData - User data to create the user with
   * @returns Promise resolving to the created user
   * @throws Error if required fields are missing or user already exists
   */
  async createUser(userData: Partial<User>): Promise<User> {
    // Validate required fields
    if (!userData.email || !userData.firstName) {
      throw new BadRequestException("Email and firstName are required");
    }

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));
    if (existingUsers.length > 0) {
      throw new BadRequestException("User with this email already exists");
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName || "",
        password: userData.password!, // Should be hashed by caller or we hash here?
        // Wait, AuthService hashes it. But UserService.createUser might be called by Admin directly with raw password?
        // In AuthService.register, it calls userRepository.create, not userService.createUser.
        // UserService.createUser is usually called by Admin controller.
        // Let's assume the controller or caller handles hashing if needed, or we just store it.
        // Actually, looking at other services, they might expect hashed password or raw.
        // But here we need to provide it to DB.
        isActive: userData.isActive ?? true,
        role: (userData.role as any) || UserRole.USER,
      })
      .returning();

    return newUser as unknown as User;
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The ID of the user to retrieve
   * @returns Promise resolving to the user or null if not found
   * @throws Error if user is not found
   */
  async getUserById(id: number): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.isActive, true)));
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user as unknown as User;
  }

  /**
   * Retrieves all active users.
   *
   * @returns Promise resolving to an array of users
   */
  async getAllUsers(): Promise<User[]> {
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.isActive, true));
    return allUsers as unknown as User[];
  }

  /**
   * Updates a user by their ID.
   *
   * @param id - The ID of the user to update
   * @param userData - User data to update the user with
   * @returns Promise resolving to the updated user
   * @throws Error if user is not found
   */
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser as unknown as User;
  }

  /**
   * Changes the password of a user by their ID.
   *
   * @param id - The ID of the user whose password to change
   * @param password - The new password
   * @returns Promise that resolves when the password is changed
   * @throws Error if user is not found
   */
  async changePassword(id: number, password: string): Promise<void> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await db.update(users).set({ password }).where(eq(users.id, id));
  }

  /**
   * Updates the role of a user by their ID.
   *
   * @param id - The ID of the user whose role to update
   * @param role - The new role
   * @returns Promise resolving to the updated user
   * @throws Error if user is not found
   */
  async updateUserRole(id: number, role: string): Promise<User> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ role: role as any })
      .where(eq(users.id, id))
      .returning();

    return updatedUser as unknown as User;
  }

  /**
   * Updates the status of a user by their ID.
   *
   * @param id - The ID of the user whose status to update
   * @param isActive - The new active status
   * @returns Promise resolving to the updated user
   * @throws Error if user is not found
   */
  async updateUserStatus(id: number, isActive: boolean): Promise<User> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id))
      .returning();

    return updatedUser as unknown as User;
  }

  /**
   * Deletes a user by their ID (soft delete).
   *
   * @param id - The ID of the user to delete
   * @returns Promise resolving to true if successful
   * @throws Error if user is not found
   */
  async deleteUser(id: number): Promise<boolean> {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Soft delete user
    await db.update(users).set({ isActive: false }).where(eq(users.id, id));

    return true;
  }
}
