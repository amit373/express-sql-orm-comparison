import { Task, User, UserRole, TaskStatus } from "@packages/types";
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@packages/common";
import { TaskRepository } from "../repositories/taskRepository";
import { UserRepository } from "../repositories/userRepository";

export interface ITaskService {
  createTask(
    taskData: Partial<Task>,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  getTaskById(
    taskId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  getTasksByUser(userId: number, userRole: UserRole): Promise<Task[]>;
  updateTask(
    taskId: number,
    taskData: Partial<Task>,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  deleteTask(
    taskId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<boolean>;
  assignTask(
    taskId: number,
    assigneeId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  updateTaskStatus(
    taskId: number,
    status: TaskStatus,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  updateTaskDueDate(
    taskId: number,
    dueDate: Date,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
  updateTaskPriority(
    taskId: number,
    priority: string,
    userId: number,
    userRole: UserRole,
  ): Promise<Task>;
}

export class TaskService implements ITaskService {
  private taskRepository = new TaskRepository();
  private userRepository = new UserRepository();

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

      // MANAGER can update tasks they created or assigned to others
      if (userRole === UserRole.MANAGER) {
        if (task.createdBy === userId || task.assignedToId === userId) {
          return await this.taskRepository.update(taskId, taskData);
        }
      }

      // USER can update their own tasks (only status usually, but this is general update)
      if (userRole === UserRole.USER && task.assignedToId === userId) {
        return await this.taskRepository.update(taskId, taskData);
      }

      throw new UnauthorizedException(
        "You do not have permission to update this task",
      );
    } catch (error) {
      throw error;
    }
  }

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
}
