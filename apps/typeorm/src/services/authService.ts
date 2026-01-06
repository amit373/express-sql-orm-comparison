import bcrypt from "bcryptjs";
import { User, UserRole } from "@packages/types";
import { BadRequestException, UnauthorizedException } from "@packages/common";
import { TokenService } from "@packages/common";
import { UserRepository } from "../repositories/userRepository";

export interface IAuthService {
  register(
    userData: Partial<User>,
  ): Promise<{ user: User; token: string; refreshToken: string }>;
  login(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string; refreshToken: string }>;
  refreshToken(token: string): Promise<{ token: string; refreshToken: string }>;
  logout(userId: number): Promise<void>;
  verifyToken(
    token: string,
  ): Promise<{ userId: number; email: string; role: UserRole }>;
}

export class AuthService implements IAuthService {
  private userRepository = new UserRepository(); // This needs to be implemented

  async register(
    userData: Partial<User>,
  ): Promise<{ user: User; token: string; refreshToken: string }> {
    try {
      // Validate required fields
      if (!userData.email || !userData.firstName || !userData.password) {
        throw new BadRequestException(
          "Email, firstName, and password are required",
        );
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(
        userData.email,
      );
      if (existingUser) {
        throw new BadRequestException("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user with default role
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword, // We'll store it in the database even though it's not in our schema
        role: userData.role || UserRole.USER,
      });

      // Generate JWT tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { user, token, refreshToken };
    } catch (error) {
      throw error;
    }
  }

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

      // Generate JWT tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { user, token, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(
    token: string,
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      const payload = await this.verifyToken(token);
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

  async logout(userId: number): Promise<void> {
    // In a stateless JWT implementation, we can't invalidate tokens without a blacklist
    // For now, we'll just return successfully
    return Promise.resolve();
  }

  async verifyToken(
    token: string,
  ): Promise<{ userId: number; email: string; role: UserRole }> {
    return TokenService.verifyToken(token);
  }

  private generateToken(user: User): string {
    return TokenService.generateToken(user);
  }

  private generateRefreshToken(user: User): string {
    return TokenService.generateRefreshToken(user);
  }
}
