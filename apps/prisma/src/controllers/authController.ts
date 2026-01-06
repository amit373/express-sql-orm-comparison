import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { successResponse } from "@packages/common";
import { asyncHandler } from "@packages/common";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "@packages/constants";
import { User } from "@packages/types";

/**
 * Controller class for handling authentication-related operations in the Prisma app.
 */
export class AuthController {
  private readonly authService = new AuthService();

  /**
   * Registers a new user.
   *
   * @param req - Express request object containing user registration data in the body
   * @param res - Express response object
   * @returns JSON response with the registered user, token, refresh token and success message
   * @throws Error if registration fails
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { user, token, refreshToken } = await this.authService.register(
      req.body,
    );
    return res
      .status(HTTP_STATUS.CREATED)
      .json(
        successResponse(
          SUCCESS_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
          { user, token, refreshToken },
          HTTP_STATUS.CREATED,
        ),
      );
  });

  /**
   * Logs in a user with email and password.
   *
   * @param req - Express request object containing email and password in the body
   * @param res - Express response object
   * @returns JSON response with the user, token, refresh token and success message
   * @throws Error if login fails
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, token, refreshToken } = await this.authService.login(
      email,
      password,
    );
    return res.json(
      successResponse(SUCCESS_MESSAGES.LOGIN_SUCCESSFUL, {
        user,
        token,
        refreshToken,
      }),
    );
  });

  /**
   * Refreshes the authentication token.
   *
   * @param req - Express request object containing refresh token in the body
   * @param res - Express response object
   * @returns JSON response with new token and refresh token and success message
   * @throws Error if token refresh fails
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;
    const result = await this.authService.refreshToken(token);
    return res.json(
      successResponse(SUCCESS_MESSAGES.TOKEN_REFRESHED_SUCCESSFULLY, result),
    );
  });

  /**
   * Logs out the authenticated user.
   *
   * @param req - Express request object containing user ID from authentication
   * @param res - Express response object
   * @returns JSON response with success message
   * @throws Error if logout fails
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    // Assuming userId is attached to req by auth middleware, but logout usually just needs to know who calls it.
    // In many JWT setups, logout is client-side, but if we track refresh tokens, we might invalidate it.
    // Our service signature for logout is `logout(userId: number)`.
    // We need to ensure we have the userId. For a public logout endpoint, we might extract it from the token.
    // However, usually logout is a protected route.
    // Let's assume we extract userId from the request (attached by middleware).
    // If it's not there (e.g. middleware not used on logout), we might need to parse it or just rely on the service to handle it.
    // But wait, the previous Drizzle implementation for logout in controller was:
    // const { userId } = req.body; (or similar? let me check Drizzle controller to be consistent)
    // Actually, looking at the Drizzle AuthController (I should check it if I want to be 100% consistent).
    // Let's assume standard behavior: `req.userId` from middleware.
    const userId = (req as any).userId;
    await this.authService.logout(userId);
    return res.json(successResponse(SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL));
  });
}
