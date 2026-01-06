import jwt from "jsonwebtoken";
import { User, UserRole } from "@packages/types";
import config from "@packages/config";
import { UnauthorizedException } from "../errors";

/**
 * Interface representing the payload of an authentication token.
 */
export interface TokenPayload {
  /** User ID */
  userId: number;
  /** User email */
  email: string;
  /** User role */
  role: UserRole;
}

/**
 * Service class for handling JWT token operations.
 */
export class TokenService {
  /**
   * Generates an authentication token for a user.
   *
   * @param user - The user to generate the token for
   * @returns The generated JWT token
   */
  static generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: "24h",
    });
  }

  /**
   * Generates a refresh token for a user.
   *
   * @param user - The user to generate the refresh token for
   * @returns The generated refresh token
   */
  static generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: "7d",
    });
  }

  /**
   * Verifies an authentication token.
   *
   * @param token - The token to verify
   * @returns The decoded token payload
   * @throws UnauthorizedException if the token is invalid or expired
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
