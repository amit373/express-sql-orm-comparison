import { eq } from "drizzle-orm";
import { User, UserRole } from "@packages/types";
import { db } from "../config";
import { users } from "../schema";

/**
 * Repository class for handling user data access operations.
 */
export class UserRepository {
  /**
   * Creates a new user in the database.
   *
   * @param userData - User data to create the user with
   * @returns Promise resolving to the created user
   */
  async create(userData: Partial<User>): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName,
        password: userData.password!, // In a real implementation, this should be hashed
        role: userData.role || UserRole.USER,
        isActive: userData.isActive ?? true,
      })
      .returning();

    return newUser as unknown as User;
  }

  /**
   * Finds a user by their ID.
   *
   * @param id - The ID of the user to find
   * @returns Promise resolving to the user or null if not found
   */
  async findById(id: number): Promise<User | null> {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user.length > 0 ? (user[0] as unknown as User) : null;
  }

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user to find
   * @returns Promise resolving to the user or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user.length > 0 ? (user[0] as unknown as User) : null;
  }

  /**
   * Updates a user by their ID.
   *
   * @param id - The ID of the user to update
   * @param userData - User data to update the user with
   * @returns Promise resolving to the updated user
   * @throws Error if user is not found
   */
  async update(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser as unknown as User;
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - The ID of the user to delete
   * @returns Promise that resolves when the user is deleted
   */
  async delete(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}
