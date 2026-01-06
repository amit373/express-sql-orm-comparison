import { Task, TaskStatus, TaskPriority } from "@packages/types";
import { prisma } from "../config/database";

export class TaskRepository {
  async create(taskData: Partial<Task>): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: taskData.title!,
        description: taskData.description || "",
        status: taskData.status || TaskStatus.PENDING,
        priority: taskData.priority || TaskPriority.MEDIUM,
        assignedToId: taskData.assignedToId!,
        createdBy: taskData.createdBy!,
      },
    });

    return this.mapToTask(task);
  }

  async findById(id: number): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    return task ? this.mapToTask(task) : null;
  }

  async findByUserId(userId: number): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ assignedToId: userId }, { createdBy: userId }],
      },
    });

    return tasks.map((task) => this.mapToTask(task));
  }

  async findAll(): Promise<Task[]> {
    const tasks = await prisma.task.findMany();
    return tasks.map((task) => this.mapToTask(task));
  }

  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignedToId: taskData.assignedToId,
        completedAt: taskData.completedAt,
      },
    });

    return this.mapToTask(task);
  }

  async delete(id: number): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }

  async findByAssignedUserId(userId: number): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: userId },
    });

    return tasks.map((task) => this.mapToTask(task));
  }

  async findByCreatedUserId(userId: number): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { createdBy: userId },
    });

    return tasks.map((task) => this.mapToTask(task));
  }

  private mapToTask(prismaTask: any): Task {
    return {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description,
      status: prismaTask.status as TaskStatus,
      priority: prismaTask.priority as TaskPriority,
      assignedToId: prismaTask.assignedToId,
      createdBy: prismaTask.createdBy,
      completedAt: prismaTask.completedAt,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    };
  }
}
