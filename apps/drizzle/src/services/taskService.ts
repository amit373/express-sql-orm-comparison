import { Task, UserRole, TaskStatus } from "@packages/types";
import { UnauthorizedException, NotFoundException } from "@packages/common";
import { TaskRepository, UserRepository } from "../repositories";

/**
 * Interface for task service operations.
 */
export interface ITaskService {
  /**
   * Creates a new task.
   *
   * @param taskData - Task data to create the task with
   * @param userId - The ID of the user creating the task
   * @param userRole - The role of the user creating the task
   * @returns Promise resolving to the created task
   * @throws Error if user doesn't have permission to create tasks
   */
  createTask(
    taskData: Partial<Task>,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  /**
   * Retrieves a task by its ID.
   *
   * @param taskId - The ID of the task to retrieve
   * @param userId - The ID of the user requesting the task
   * @param userRole - The role of the user requesting the task
   * @returns Promise resolving to the task
   * @throws Error if task is not found or user doesn't have permission to access it
   */
  getTaskById(
    taskId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  /**
   * Retrieves all tasks for a user based on their role.
   *
   * @param userId - The ID of the user requesting tasks
   * @param userRole - The role of the user requesting tasks
   * @returns Promise resolving to an array of tasks
   * @throws Error if user doesn't have permission to view tasks
   */
  getTasksByUser(userId: number, userRole: UserRole): Promise<Task[]>;
  /**
   * Updates a task by its ID.
   *
   * @param taskId - The ID of the task to update
   * @param taskData - Task data to update the task with
   * @param userId - The ID of the user updating the task
   * @param userRole - The role of the user updating the task
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found or user doesn't have permission to update it
   */
  updateTask(
    taskId: number,
    taskData: Partial<Task>,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  /**
   * Deletes a task by its ID.
   *
   * @param taskId - The ID of the task to delete
   * @param userId - The ID of the user deleting the task
   * @param userRole - The role of the user deleting the task
   * @returns Promise resolving to true if successful
   * @throws Error if task is not found or user doesn't have permission to delete it
   */
  deleteTask(
    taskId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<boolean>;
  /**
   * Assigns a task to a user.
   *
   * @param taskId - The ID of the task to assign
   * @param assigneeId - The ID of the user to assign the task to
   * @param userId - The ID of the user assigning the task
   * @param userRole - The role of the user assigning the task
   * @returns Promise resolving to the assigned task
   * @throws Error if task or assignee is not found, or user doesn't have permission to assign tasks
   */
  assignTask(
    taskId: number,
    assigneeId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  /**
   * Updates the status of a task by its ID.
   *
   * @param taskId - The ID of the task to update status for
   * @param status - The new status for the task
   * @param userId - The ID of the user updating the task status
   * @param userRole - The role of the user updating the task status
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found or user doesn't have permission to update status
   */
  updateTaskStatus(
    taskId: number,
    status: TaskStatus,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  /**
   * Updates the due date of a task by its ID.
   *
   * @param taskId - The ID of the task to update due date for
   * @param dueDate - The new due date for the task
   * @param userId - The ID of the user updating the task due date
   * @param userRole - The role of the user updating the task due date
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found or user doesn't have permission to update due date
   */
  updateTaskDueDate(
    taskId: number,
    dueDate: Date,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  /**
   * Updates the priority of a task by its ID.
   *
   * @param taskId - The ID of the task to update priority for
   * @param priority - The new priority for the task
   * @param userId - The ID of the user updating the task priority
   * @param userRole - The role of the user updating the task priority
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found or user doesn't have permission to update priority
   */
  updateTaskPriority(
    taskId: number,
    priority: string,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
}

/**
 * Service class for handling task-related business logic.
 */
export class TaskService implements ITaskService {
  private taskRepository = new TaskRepository();
  private userRepository = new UserRepository();

  /**
   * Creates a new task.
   *
   * @param taskData - Task data to create the task with
   * @param userId - The ID of the user creating the task
   * @param userRole - The role of the user creating the task
   * @returns Promise resolving to the created task
   * @throws Error if user doesn't have permission to create tasks
   */
  async createTask(
    taskData: Partial<Task>,
    userId: number,
    userRole: UserRole,
  ): Promise<Task> {
    try {
      // Only ADMIN and MANAGER can create tasks
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
        throw new UnauthorizedException(
          "Only ADMIN and MANAGER can create tasks",
        );
      }

      // Create task with the current user as the creator
      const task = await this.taskRepository.create({
        ...taskData,
        createdBy: userId,
        assignedToId: taskData.assignedToId || userId, // Default to creator if not assigned
      });

      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a task by its ID.
   *
   * @param taskId - The ID of the task to retrieve
   * @param userId - The ID of the user requesting the task
   * @param userRole - The role of the user requesting the task
   * @returns Promise resolving to the task
   * @throws Error if task is not found or user doesn't have permission to access it
   */
  async getTaskById(
    taskId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      // ADMIN can access any task
      if (userRole === UserRole.ADMIN) {
        return task;
      }

      // MANAGER can access tasks they created or assigned to others
      if (
        userRole === UserRole.MANAGER &&
        (task.createdBy === userId || task.assignedToId === userId)
      ) {
        return task;
      }

      // USER can only access tasks assigned to them
      if (userRole === UserRole.USER && task.assignedToId === userId) {
        return task;
      }

      throw new UnauthorizedException(
        "You do not have permission to access this task",
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves all tasks for a user based on their role.
   *
   * @param userId - The ID of the user requesting tasks
   * @param userRole - The role of the user requesting tasks
   * @returns Promise resolving to an array of tasks
   * @throws Error if user doesn't have permission to view tasks
   */
  async getTasksByUser(userId: number, userRole: UserRole): Promise<Task[]> {
    try {
      // ADMIN can see all tasks
      if (userRole === UserRole.ADMIN) {
        return await this.taskRepository.findAll();
      }

      // MANAGER can see tasks they created or assigned to others
      if (userRole === UserRole.MANAGER) {
        return await this.taskRepository.findByUserId(userId);
      }

      // USER can only see tasks assigned to them
      if (userRole === UserRole.USER) {
        return await this.taskRepository.findByAssignedUserId(userId);
      }

      throw new UnauthorizedException(
        "You do not have permission to view tasks",
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a task by its ID.
   *
   * @param taskId - The ID of the task to update
   * @param taskData - Task data to update the task with
   * @param userId - The ID of the user updating the task
   * @param userRole - The role of the user updating the task
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found or user doesn't have permission to update it
   */
  async updateTask(
    taskId: number,
    taskData: Partial<Task>,
    userId: number,
    userRole: UserRole,
  ): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      // ADMIN can update any task
      if (userRole === UserRole.ADMIN) {
        return await this.taskRepository.update(taskId, taskData);
      }

      // MANAGER can update tasks they created
      if (userRole === UserRole.MANAGER && task.createdBy === userId) {
        // MANAGER can also update status and assign tasks
        return await this.taskRepository.update(taskId, taskData);
      }

      // USER can only update status of tasks assigned to them
      if (userRole === UserRole.USER && task.assignedToId === userId) {
        // Only allow updating status and completion date
        const allowedUpdates = {
          status: taskData.status,
          completedAt: taskData.completedAt,
        };

        return await this.taskRepository.update(taskId, allowedUpdates);
      }

      throw new UnauthorizedException(
        "You do not have permission to update this task",
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a task by its ID.
   *
   * @param taskId - The ID of the task to delete
   * @param userId - The ID of the user deleting the task
   * @param userRole - The role of the user deleting the task
   * @returns Promise resolving to true if successful
   * @throws Error if task is not found or user doesn't have permission to delete it
   */
  async deleteTask(
    taskId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<boolean> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      // Only ADMIN can delete tasks
      if (userRole !== UserRole.ADMIN) {
        throw new UnauthorizedException("Only ADMIN can delete tasks");
      }

      await this.taskRepository.delete(taskId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assigns a task to a user.
   *
   * @param taskId - The ID of the task to assign
   * @param assigneeId - The ID of the user to assign the task to
   * @param userId - The ID of the user assigning the task
   * @param userRole - The role of the user assigning the task
   * @returns Promise resolving to the assigned task
   * @throws Error if task or assignee is not found, or user doesn't have permission to assign tasks
   */
  async assignTask(
    taskId: number,
    assigneeId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<Task> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      // Only ADMIN and MANAGER can assign tasks
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
        throw new UnauthorizedException(
          "Only ADMIN and MANAGER can assign tasks",
        );
      }

      // Verify assignee exists
      const assignee = await this.userRepository.findById(assigneeId);
      if (!assignee) {
        throw new NotFoundException(`User with id ${assigneeId} not found`);
      }

      // Update task assignment
      const updatedTask = await this.taskRepository.update(taskId, {
        assignedToId: assigneeId,
      });
      return updatedTask;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates the status of a task by its ID.
   *
   * @param taskId - The ID of the task to update status for
   * @param status - The new status for the task
   * @param userId - The ID of the user updating the task status
   * @param userRole - The role of the user updating the task status
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found or user doesn't have permission to update status
   */
  async updateTaskStatus(
    taskId: number,
    status: TaskStatus,
    userId: number,
    userRole: UserRole,
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    // USER can update status of their own tasks
    if (userRole === UserRole.USER && task.assignedToId !== userId) {
      throw new UnauthorizedException(
        "You can only update status of your own tasks",
      );
    }

    // MANAGER can update status of team tasks (created or assigned)
    if (
      userRole === UserRole.MANAGER &&
      task.createdBy !== userId &&
      task.assignedToId !== userId
    ) {
      throw new UnauthorizedException(
        "You do not have permission to update this task",
      );
    }

    return await this.taskRepository.update(taskId, { status });
  }

  /**
   * Updates the due date of a task by its ID.
   *
   * @param taskId - The ID of the task to update due date for
   * @param dueDate - The new due date for the task
   * @param userId - The ID of the user updating the task due date
   * @param userRole - The role of the user updating the task due date
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found or user doesn't have permission to update due date
   */
  async updateTaskDueDate(
    taskId: number,
    dueDate: Date,
    userId: number,
    userRole: UserRole,
  ): Promise<Task> {
    // Only ADMIN and MANAGER can update due date
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
      throw new UnauthorizedException(
        "Only ADMIN and MANAGER can update task due date",
      );
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    return await this.taskRepository.update(taskId, { dueDate } as any);
  }

  /**
   * Updates the priority of a task by its ID.
   *
   * @param taskId - The ID of the task to update priority for
   * @param priority - The new priority for the task
   * @param userId - The ID of the user updating the task priority
   * @param userRole - The role of the user updating the task priority
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found or user doesn't have permission to update priority
   */
  async updateTaskPriority(
    taskId: number,
    priority: string,
    userId: number,
    userRole: UserRole,
  ): Promise<Task> {
    // Only ADMIN and MANAGER can update priority
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
      throw new UnauthorizedException(
        "Only ADMIN and MANAGER can update task priority",
      );
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    return await this.taskRepository.update(taskId, {
      priority: priority as any,
    });
  }
}
