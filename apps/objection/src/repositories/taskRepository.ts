import { Model } from "objection";
import { Task, TaskStatus, TaskPriority } from "@packages/types";
import { Task as TaskModel } from "../models/Task";

export class TaskRepository {
  async create(taskData: Partial<Task>): Promise<Task> {
    const task = await TaskModel.query().insert({
      title: taskData.title!,
      description: taskData.description,
      status: taskData.status || TaskStatus.PENDING,
      priority: taskData.priority || TaskPriority.MEDIUM,
      assignedToId: taskData.assignedToId!,
      createdBy: taskData.createdBy!,
      completedAt: taskData.completedAt,
    });

    return {
      ...task,
      description: task.description || undefined,
    } as unknown as Task;
  }

  async findById(id: number): Promise<Task | null> {
    const dbTask = await TaskModel.query().findById(id);
    if (!dbTask) return null;
    return {
      ...dbTask,
      description: dbTask.description || undefined,
    } as unknown as Task;
  }

  async findByUserId(userId: number): Promise<Task[]> {
    const tasks = await TaskModel.query().where(
      Model.raw(
        "?? = ? OR ?? = ?",
        "assignedToId",
        userId,
        "createdBy",
        userId,
      ),
    );

    return tasks.map((task) => ({
      ...task,
      description: task.description || undefined,
    })) as unknown as Task[];
  }

  async findAll(): Promise<Task[]> {
    const dbTasks = await TaskModel.query();
    return dbTasks.map((task) => ({
      ...task,
      description: task.description || undefined,
    })) as unknown as Task[];
  }

  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    const task = await TaskModel.query().patchAndFetchById(
      id,
      taskData as Partial<TaskModel>,
    );
    if (!task) {
      throw new Error("Task not found");
    }

    return {
      ...task,
      description: task.description || undefined,
    } as unknown as Task;
  }

  async delete(id: number): Promise<void> {
    await TaskModel.query().deleteById(id);
  }

  async findByAssignedUserId(userId: number): Promise<Task[]> {
    const dbTasks = await TaskModel.query().where("assignedToId", userId);
    return dbTasks.map((task) => ({
      ...task,
      description: task.description || undefined,
    })) as unknown as Task[];
  }

  async findByCreatedUserId(userId: number): Promise<Task[]> {
    const dbTasks = await TaskModel.query().where("createdBy", userId);
    return dbTasks.map((task) => ({
      ...task,
      description: task.description || undefined,
    })) as unknown as Task[];
  }
}
