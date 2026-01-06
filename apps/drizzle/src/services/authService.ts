import bcrypt from "bcryptjs";
import { User, UserRole } from "@packages/types";
import {
  BadRequestException,
  UnauthorizedException,
  TokenService,
} from "@packages/common";
import { UserRepository } from "../repositories/userRepository";

/**
 * Interface for authentication service operations.
 */
export interface IAuthService {
  /**
   * Registers a new user.
   *
   * @param userData - User data for registration
   * @returns Promise resolving to user object, access token and refresh token
   * @throws Error if required fields are missing or user already exists
   */
  register(
    userData: Partial<User>,
  ): Promise<{ user: User; token: string; refreshToken: string }>;
  /**
   * Logs in a user with email and password.
   *
   * @param email - The user's email address
   * @param password - The user's password
   * @returns Promise resolving to user object, access token and refresh token
   * @throws Error if email or password is invalid
   */
  login(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string; refreshToken: string }>;
  /**
   * Refreshes an authentication token.
   *
   * @param token - The refresh token
   * @returns Promise resolving to new access token and refresh token
   * @throws Error if the refresh token is invalid
   */
  refreshToken(token: string): Promise<{ token: string; refreshToken: string }>;
  /**
   * Logs out a user.
   *
   * @param userId - The ID of the user to log out
   * @returns Promise that resolves when logout is complete
   */
  logout(userId: number): Promise<void>;
  /**
   * Verifies an authentication token.
   *
   * @param token - The token to verify
   * @returns Promise resolving to the decoded token payload
   * @throws Error if the token is invalid
   */
  verifyToken(
    token: string,
  ): Promise<{ userId: number; email: string; role: UserRole }>;
}

/**
 * Service class for handling authentication-related business logic.
 */
export class AuthService implements IAuthService {
  private readonly userRepository = new UserRepository();

  /**
   * Registers a new user.
   *
   * @param userData - User data for registration
   * @returns Promise resolving to user object, access token and refresh token
   * @throws Error if required fields are missing or user already exists
   */
  async register(
    userData: Partial<User>,
  ): Promise<{ user: User; token: string; refreshToken: string }> {
    // Validate required fields
    if (
      !userData.email ||
      !userData.firstName ||
      !userData.password ||
      !userData.lastName
    ) {
      throw new BadRequestException(
        "Email, firstName, lastName, and password are required",
      );
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user with default role
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
    });

    // Generate JWT token
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user, token, refreshToken };
  }

  /**
   * Logs in a user with email and password.
   *
   * @param email - The user's email address
   * @param password - The user's password
   * @returns Promise resolving to user object, access token and refresh token
   * @throws Error if email or password is invalid
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string; refreshToken: string }> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException("Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid email or password");
      }

      // Generate JWT token
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { user, token, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refreshes an authentication token.
   *
   * @param token - The refresh token
   * @returns Promise resolving to new access token and refresh token
   * @throws Error if the refresh token is invalid
   */
  async refreshToken(
    token: string,
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      const payload = await TokenService.verifyToken(token);

      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Logs out a user.
   *
   * @param userId - The ID of the user to log out
   * @returns Promise that resolves when logout is complete
   */
  async logout(userId: number): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Verifies an authentication token.
   *
   * @param token - The token to verify
   * @returns Promise resolving to the decoded token payload
   * @throws Error if the token is invalid
   */
  async verifyToken(
    token: string,
  ): Promise<{ userId: number; email: string; role: UserRole }> {
    const decoded = TokenService.verifyToken(token);

    return decoded;
  }

  /**
   * Generates an access token for a user.
   *
   * @param user - The user to generate the token for
   * @returns The generated access token
   */
  private generateToken(user: User): string {
    return TokenService.generateToken(user);
  }

  /**
   * Generates a refresh token for a user.
   *
   * @param user - The user to generate the refresh token for
   * @returns The generated refresh token
   */
  private generateRefreshToken(user: User): string {
    return TokenService.generateRefreshToken(user);
  }
}
