import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Task as TypeOrmTask } from "../entities/Task";
import { Task, TaskStatus, TaskPriority } from "@packages/types";

export class TaskRepository {
  private readonly repository: Repository<TypeOrmTask> =
    AppDataSource.getRepository(TypeOrmTask);

  async create(taskData: Partial<Task>): Promise<Task> {
    const task = new TypeOrmTask();
    task.title = taskData.title!;
    task.description = taskData.description || "";
    task.status = taskData.status || TaskStatus.PENDING;
    task.priority = taskData.priority || TaskPriority.MEDIUM;
    task.assignedToId = taskData.assignedToId!;
    task.createdBy = taskData.createdBy!;

    const savedTask = await this.repository.save(task);

    return this.mapToTask(savedTask);
  }

  async findById(id: number): Promise<Task | null> {
    const task = await this.repository.findOne({ where: { id } });
    return task ? this.mapToTask(task) : null;
  }

  async findByUserId(userId: number): Promise<Task[]> {
    const tasks = await this.repository.find({
      where: [{ assignedToId: userId }, { createdBy: userId }],
    });

    return tasks.map((task) => this.mapToTask(task));
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.repository.find();
    return tasks.map((task) => this.mapToTask(task));
  }

  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    const task = await this.repository.findOne({ where: { id } });
    if (!task) {
      throw new Error("Task not found");
    }

    Object.assign(task, {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assignedToId: taskData.assignedToId,
      completedAt: taskData.completedAt,
    });

    const updatedTask = await this.repository.save(task);
    return this.mapToTask(updatedTask);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async findByAssignedUserId(userId: number): Promise<Task[]> {
    const tasks = await this.repository.find({
      where: { assignedToId: userId },
    });
    return tasks.map((task) => this.mapToTask(task));
  }

  async findByCreatedUserId(userId: number): Promise<Task[]> {
    const tasks = await this.repository.find({ where: { createdBy: userId } });
    return tasks.map((task) => this.mapToTask(task));
  }

  private mapToTask(typeOrmTask: TypeOrmTask): Task {
    return {
      id: typeOrmTask.id,
      title: typeOrmTask.title,
      description: typeOrmTask.description,
      status: typeOrmTask.status as TaskStatus,
      priority: typeOrmTask.priority as TaskPriority,
      assignedToId: typeOrmTask.assignedToId,
      createdBy: typeOrmTask.createdBy,
      completedAt: typeOrmTask.completedAt || undefined,
      createdAt: typeOrmTask.createdAt,
      updatedAt: typeOrmTask.updatedAt,
    };
  }
}
