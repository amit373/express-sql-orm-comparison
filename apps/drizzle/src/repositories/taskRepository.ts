import { db } from "../config";
import { tasks } from "../schema";
import { eq, or } from "drizzle-orm";
import { Task, TaskStatus, TaskPriority } from "@packages/types";

/**
 * Repository class for handling task data access operations.
 */
export class TaskRepository {
  /**
   * Creates a new task in the database.
   *
   * @param taskData - Task data to create the task with
   * @returns Promise resolving to the created task
   */
  async create(taskData: Partial<Task>): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({
        title: taskData.title!,
        description: taskData.description ?? "",
        status: taskData.status || TaskStatus.PENDING,
        priority: taskData.priority || TaskPriority.MEDIUM,
        assignedToId: taskData.assignedToId!,
        createdBy: taskData.createdBy!,
        completedAt: taskData.completedAt,
      })
      .returning();

    return newTask as unknown as Task;
  }

  /**
   * Finds a task by its ID.
   *
   * @param id - The ID of the task to find
   * @returns Promise resolving to the task or null if not found
   */
  async findById(id: number): Promise<Task | null> {
    const task = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return task.length > 0 ? (task[0] as unknown as Task) : null;
  }

  /**
   * Finds tasks by user ID (either assigned or created by the user).
   *
   * @param userId - The ID of the user to find tasks for
   * @returns Promise resolving to an array of tasks
   */
  async findByUserId(userId: number): Promise<Task[]> {
    const userTasks = await db
      .select()
      .from(tasks)
      .where(or(eq(tasks.assignedToId, userId), eq(tasks.createdBy, userId)));

    return userTasks as unknown as Task[];
  }

  /**
   * Finds all tasks in the database.
   *
   * @returns Promise resolving to an array of all tasks
   */
  async findAll(): Promise<Task[]> {
    return (await db.select().from(tasks)) as unknown as Task[];
  }

  /**
   * Updates a task by its ID.
   *
   * @param id - The ID of the task to update
   * @param taskData - Task data to update the task with
   * @returns Promise resolving to the updated task
   * @throws Error if task is not found
   */
  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask) {
      throw new Error("Task not found");
    }

    return updatedTask as unknown as Task;
  }

  /**
   * Deletes a task by its ID.
   *
   * @param id - The ID of the task to delete
   * @returns Promise that resolves when the task is deleted
   */
  async delete(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  /**
   * Finds tasks assigned to a specific user.
   *
   * @param userId - The ID of the user to find assigned tasks for
   * @returns Promise resolving to an array of tasks assigned to the user
   */
  async findByAssignedUserId(userId: number): Promise<Task[]> {
    return (await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedToId, userId))) as unknown as Task[];
  }

  /**
   * Finds tasks created by a specific user.
   *
   * @param userId - The ID of the user to find created tasks for
   * @returns Promise resolving to an array of tasks created by the user
   */
  async findByCreatedUserId(userId: number): Promise<Task[]> {
    return (await db
      .select()
      .from(tasks)
      .where(eq(tasks.createdBy, userId))) as unknown as Task[];
  }
}
