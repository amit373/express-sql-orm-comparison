import { Op } from "sequelize";
import { Task, TaskStatus, TaskPriority } from "@packages/types";
import { Task as TaskModel } from "../models";

export class TaskRepository {
  async create(taskData: Partial<Task>): Promise<Task> {
    const task = await TaskModel.create({
      title: taskData.title!,
      description: taskData.description || "",
      status: taskData.status || TaskStatus.PENDING,
      priority: taskData.priority || TaskPriority.MEDIUM,
      assignedToId: taskData.assignedToId!,
      createdBy: taskData.createdBy!,
      completedAt: taskData.completedAt,
    } as Task);

    return task.toJSON();
  }

  async findById(id: number): Promise<Task | null> {
    const task = await TaskModel.findByPk(id);
    return task ? task.toJSON() : null;
  }

  async findByUserId(userId: number): Promise<Task[]> {
    const tasks = await TaskModel.findAll({
      where: {
        [Op.or]: [{ assignedToId: userId }, { createdBy: userId }],
      },
    });

    return tasks.map((task: TaskModel) => task.toJSON());
  }

  async findAll(): Promise<Task[]> {
    const tasks = await TaskModel.findAll();
    return tasks.map((task: TaskModel) => task.toJSON());
  }

  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    const task = await TaskModel.findByPk(id);
    if (!task) {
      throw new Error("Task not found");
    }

    await task.update(taskData as Partial<Task>);
    return task.toJSON();
  }

  async delete(id: number): Promise<void> {
    await TaskModel.destroy({ where: { id } });
  }

  async findByAssignedUserId(userId: number): Promise<Task[]> {
    const tasks = await TaskModel.findAll({ where: { assignedToId: userId } });
    return tasks.map((task: TaskModel) => task.toJSON());
  }

  async findByCreatedUserId(userId: number): Promise<Task[]> {
    const tasks = await TaskModel.findAll({ where: { createdBy: userId } });
    return tasks.map((task: TaskModel) => task.toJSON());
  }
}
