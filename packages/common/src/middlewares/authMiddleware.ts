import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../errors";
import { TokenService } from "../token";
import { UserRole } from "@packages/types";

export interface AuthRequest extends Request {
  userId?: number;
  email?: string;
  role?: UserRole;
}

// Type for the function that finds a user by ID
export type UserFinder = (
  id: number,
) => Promise<{ id: number; isActive: boolean } | null>;

/**
 * Creates an authentication middleware that verifies the JWT token
 * and optionally checks if the user exists and is active in the database.
 *
 * @param findUserById - Optional function to find user by ID. If provided, user existence and active status will be verified.
 */
export const createAuthMiddleware = (findUserById?: UserFinder) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]; // Bearer token

      if (!token) {
        throw new UnauthorizedException("Access token is required");
      }

      // Verify token using the token service
      try {
        const decoded = TokenService.verifyToken(token);

        req.userId = decoded.userId;
        req.email = decoded.email;
        req.role = decoded.role;

        // If a user finder is provided, verify user existence and status
        if (findUserById) {
          const user = await findUserById(decoded.userId);

          if (!user) {
            throw new UnauthorizedException("User no longer exists");
          }

          if (!user.isActive) {
            throw new UnauthorizedException("User account is inactive");
          }
        }

        next();
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException("Invalid or expired token");
      }
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Legacy authentication middleware that only verifies the token.
 * @deprecated Use createAuthMiddleware(userFinder) instead to ensure user existence.
 */
export const authenticate = createAuthMiddleware();

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role) {
      throw new UnauthorizedException("Access denied");
    }

    if (!roles.includes(req.role)) {
      throw new UnauthorizedException("Insufficient permissions");
    }

    next();
  };
};
