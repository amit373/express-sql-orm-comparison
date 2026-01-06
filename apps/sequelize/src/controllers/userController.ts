import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { successResponse, errorResponse } from "@packages/common";
import { asyncHandler } from "@packages/common";
import {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@packages/constants";

/**
 * Controller class for handling user-related operations in the Sequelize app.
 */
export class UserController {
  private readonly userService = new UserService();

  /**
   * Creates a new user.
   *
   * @param req - Express request object containing user data in the body
   * @param res - Express response object
   * @returns JSON response with the created user and success message
   * @throws Error if user creation fails
   */
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    return res
      .status(HTTP_STATUS.CREATED)
      .json(
        successResponse(
          SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY,
          user,
          HTTP_STATUS.CREATED,
        ),
      );
  });

  /**
   * Retrieves a user by their ID.
   *
   * @param req - Express request object containing user ID in the params
   * @param res - Express response object
   * @returns JSON response with the retrieved user and success message
   * @throws Error if user retrieval fails or user not found
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.getUserById(Number(id));
    return res.json(
      successResponse(SUCCESS_MESSAGES.USER_RETRIEVED_SUCCESSFULLY, user),
    );
  });

  /**
   * Retrieves all users.
   *
   * @param req - Express request object
   * @param res - Express response object
   * @returns JSON response with all users and success message
   * @throws Error if users retrieval fails
   */
  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.getAllUsers();
    return res.json(
      successResponse(SUCCESS_MESSAGES.USERS_RETRIEVED_SUCCESSFULLY, users),
    );
  });

  /**
   * Updates a user by their ID.
   *
   * @param req - Express request object containing user ID in the params and update data in the body
   * @param res - Express response object
   * @returns JSON response with the updated user and success message
   * @throws Error if user update fails
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.updateUser(Number(id), req.body);
    return res.json(
      successResponse(SUCCESS_MESSAGES.USER_UPDATED_SUCCESSFULLY, user),
    );
  });

  /**
   * Updates the role of a user by their ID.
   *
   * @param req - Express request object containing user ID in the params and role data in the body
   * @param res - Express response object
   * @returns JSON response with the updated user and success message
   * @throws Error if user role update fails
   */
  updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    const user = await this.userService.updateUserRole(Number(id), role);
    return res.json(successResponse("User role updated successfully", user));
  });

  /**
   * Updates the status of a user by their ID.
   *
   * @param req - Express request object containing user ID in the params and status data in the body
   * @param res - Express response object
   * @returns JSON response with the updated user and success message
   * @throws Error if user status update fails
   */
  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // Assuming body has { status: 'active' | 'inactive' } or boolean?
    // User requirement says "Activate / Deactivate user". Let's assume boolean isActive or status string.
    // In service I implemented updateUserStatus(id, isActive: boolean).
    // Let's assume body { status: 'active' } -> true, 'inactive' -> false.
    // Or body { isActive: true }.
    // The requirement says "Activate / Deactivate user".
    // I'll check what I did in TypeORM.
    // In TypeORM userController I didn't check, but service used boolean.
    // Let's assume body has isActive.
    const isActive = req.body.status === "active" || req.body.isActive === true;
    const user = await this.userService.updateUserStatus(Number(id), isActive);
    return res.json(successResponse("User status updated successfully", user));
  });

  /**
   * Deletes a user by their ID.
   *
   * @param req - Express request object containing user ID in the params
   * @param res - Express response object
   * @returns JSON response with success message or error if user not found
   * @throws Error if user deletion fails
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.userService.deleteUser(Number(id));
    if (result) {
      return res.json(
        successResponse(SUCCESS_MESSAGES.USER_DELETED_SUCCESSFULLY),
      );
    } else {
      return res
        .status(404)
        .json(errorResponse(ERROR_MESSAGES.USER_NOT_FOUND, 404));
    }
  });
}
