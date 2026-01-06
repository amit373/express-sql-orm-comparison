import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { successResponse } from "@packages/common";
import { asyncHandler } from "@packages/common";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "@packages/constants";
import { User } from "@packages/types";

/**
 * Controller class for handling authentication-related operations in the TypeORM app.
 */
export class AuthController {
  private authService = new AuthService();

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
    const { refreshToken } = req.body;
    const tokens = await this.authService.refreshToken(refreshToken);
    return res.json(successResponse("Token refreshed successfully", tokens));
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
    // In a stateless system, we might not have the userId here if it's just a logout call without auth header,
    // but typically logout requires auth.
    // Assuming the auth middleware attaches user info to req.user (which we can cast or use custom interface)
    // But for now, just calling service logout which is a placeholder.
    await this.authService.logout(0); // UserId not strictly needed for stateless
    return res.json(successResponse("Logout successful"));
  });
}
