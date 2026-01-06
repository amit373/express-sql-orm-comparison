import { Request, Response } from "express";
import { TaskService } from "../services/taskService";
import { successResponse, errorResponse } from "@packages/common";
import { asyncHandler } from "@packages/common";
import {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@packages/constants";
import { Task, UserRole } from "@packages/types";

interface AuthRequest extends Request {
  userId?: number;
  role?: UserRole;
}

/**
 * Controller class for handling task-related operations in the Sequelize app.
 */
export class TaskController {
  private readonly taskService = new TaskService();

  /**
   * Creates a new task.
   *
   * @param req - Express request object containing task data in the body and user info from authentication
   * @param res - Express response object
   * @returns JSON response with the created task and success message
   * @throws Error if task creation fails
   */
  createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await this.taskService.createTask(
      req.body,
      req.userId!,
      req.role!,
    );
    return res
      .status(HTTP_STATUS.CREATED)
      .json(
        successResponse(
          SUCCESS_MESSAGES.TASK_CREATED_SUCCESSFULLY,
          task,
          HTTP_STATUS.CREATED,
        ),
      );
  });

  /**
   * Retrieves a task by its ID.
   *
   * @param req - Express request object containing task ID in the params and user info from authentication
   * @param res - Express response object
   * @returns JSON response with the retrieved task and success message
   * @throws Error if task retrieval fails or task not found
   */
  getTaskById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = Number(req.params.id!);
    const task = await this.taskService.getTaskById(
      taskId,
      req.userId!,
      req.role!,
    );
    return res.json(
      successResponse(SUCCESS_MESSAGES.TASK_RETRIEVED_SUCCESSFULLY, task),
    );
  });

  /**
   * Retrieves all tasks assigned to the authenticated user.
   *
   * @param req - Express request object containing user info from authentication
   * @param res - Express response object
   * @returns JSON response with the user's tasks and success message
   * @throws Error if task retrieval fails
   */
  getTasksByUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const tasks = await this.taskService.getTasksByUser(req.userId!, req.role!);
    return res.json(
      successResponse(SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY, tasks),
    );
  });

  /**
   * Updates a task by its ID.
   *
   * @param req - Express request object containing task ID in the params, update data in the body, and user info from authentication
   * @param res - Express response object
   * @returns JSON response with the updated task and success message
   * @throws Error if task update fails
   */
  updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = Number(req.params.id!);
    const task = await this.taskService.updateTask(
      taskId,
      req.body,
      req.userId!,
      req.role!,
    );
    return res.json(
      successResponse(SUCCESS_MESSAGES.TASK_UPDATED_SUCCESSFULLY, task),
    );
  });

  /**
   * Updates the status of a task by its ID.
   *
   * @param req - Express request object containing task ID in the params, status in the body, and user info from authentication
   * @param res - Express response object
   * @returns JSON response with the updated task and success message
   * @throws Error if task status update fails
   */
  updateTaskStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = Number(req.params.id!);
    const { status } = req.body;
    const task = await this.taskService.updateTaskStatus(
      taskId,
      status,
      req.userId!,
      req.role!,
    );
    return res.json(successResponse("Task status updated successfully", task));
  });

  /**
   * Updates the due date of a task by its ID.
   *
   * @param req - Express request object containing task ID in the params, due date in the body, and user info from authentication
   * @param res - Express response object
   * @returns JSON response with the updated task and success message
   * @throws Error if task due date update fails
   */
  updateTaskDueDate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = Number(req.params.id!);
    const { dueDate } = req.body;
    const task = await this.taskService.updateTaskDueDate(
      taskId,
      dueDate,
      req.userId!,
      req.role!,
    );
    return res.json(
      successResponse("Task due date updated successfully", task),
    );
  });

  /**
   * Updates the priority of a task by its ID.
   *
   * @param req - Express request object containing task ID in the params, priority in the body, and user info from authentication
   * @param res - Express response object
   * @returns JSON response with the updated task and success message
   * @throws Error if task priority update fails
   */
  updateTaskPriority = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = Number(req.params.id!);
    const { priority } = req.body;
    const task = await this.taskService.updateTaskPriority(
      taskId,
      priority,
      req.userId!,
      req.role!,
    );
    return res.json(
      successResponse("Task priority updated successfully", task),
    );
  });

  /**
   * Deletes a task by its ID.
   *
   * @param req - Express request object containing task ID in the params and user info from authentication
   * @param res - Express response object
   * @returns JSON response with success message or error if task not found
   * @throws Error if task deletion fails
   */
  deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = Number(req.params.id!);
    const result = await this.taskService.deleteTask(
      taskId,
      req.userId!,
      req.role!,
    );
    if (result) {
      return res.json(
        successResponse(SUCCESS_MESSAGES.TASK_DELETED_SUCCESSFULLY),
      );
    } else {
      return res
        .status(404)
        .json(errorResponse(ERROR_MESSAGES.TASK_NOT_FOUND, 404));
    }
  });

  /**
   * Assigns a task to a user.
   *
   * @param req - Express request object containing task ID in the params, assignee ID in the body, and user info from authentication
   * @param res - Express response object
   * @returns JSON response with the assigned task and success message
   * @throws Error if task assignment fails
   */
  assignTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const taskId = Number(req.params.id!);
    const { assigneeId } = req.body;
    const task = await this.taskService.assignTask(
      taskId,
      assigneeId,
      req.userId!,
      req.role!,
    );
    return res.json(
      successResponse(SUCCESS_MESSAGES.TASK_ASSIGNED_SUCCESSFULLY, task),
    );
  });
}
