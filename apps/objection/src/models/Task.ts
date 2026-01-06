import { Model } from "objection";
import {
  Task as TaskInterface,
  TaskStatus,
  TaskPriority,
} from "@packages/types";
import { User } from "./User";

export class Task extends Model implements TaskInterface {
  id!: number;
  title!: string;
  description!: string;
  status!: TaskStatus;
  priority!: TaskPriority;
  assignedToId!: number;
  createdBy!: number;
  completedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  // Define relations
  assignedTo?: User;
  creator?: User;

  static override get tableName() {
    return "tasks";
  }

  static override get jsonSchema() {
    return {
      type: "object",
      required: ["title", "status", "priority", "assignedToId", "createdBy"],

      properties: {
        id: { type: "integer" },
        title: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: ["string", "null"], default: null },
        status: { type: "string", enum: Object.values(TaskStatus) },
        priority: { type: "string", enum: Object.values(TaskPriority) },
        assignedToId: { type: "integer" },
        createdBy: { type: "integer" },
        completedAt: { type: "string", format: "date-time" },
      },
    };
  }

  static override get relationMappings() {
    return {
      assignedTo: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tasks.assigned_to_id",
          to: "users.id",
        },
      },
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tasks.created_by",
          to: "users.id",
        },
      },
    };
  }
}
