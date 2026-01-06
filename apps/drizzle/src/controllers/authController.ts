import { Request, Response } from "express";
import { AuthService } from "../services";
import { asyncHandler, successResponse } from "@packages/common";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "@packages/constants";

/**
 * Controller class for handling authentication-related operations.
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
    const { refreshToken } = req.body;
    const result = await this.authService.refreshToken(refreshToken);
    return res.json(successResponse("Token refreshed successfully", result));
  });

  /**
   * Logs out the authenticated user.
   *
   * @param req - Express request object containing user ID from authentication
   * @param res - Express response object
   * @returns JSON response with success message
   * @throws Error if logout fails
   */
  logout = asyncHandler(async (req: any, res: Response) => {
    await this.authService.logout(req.userId);
    return res.json(successResponse("Logout successful"));
  });
}
