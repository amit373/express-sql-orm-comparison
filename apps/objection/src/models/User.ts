import { Model } from "objection";
import { User as UserInterface, UserRole } from "@packages/types";
import { Task } from "./Task";

export class User extends Model implements UserInterface {
  id!: number;
  email!: string;
  firstName!: string;
  lastName!: string;
  password!: string;
  role!: UserRole;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Define relations
  tasksCreated?: Task[];
  tasksAssigned?: Task[];

  static override get tableName() {
    return "users";
  }

  static override get jsonSchema() {
    return {
      type: "object",
      required: ["email", "firstName", "password", "role", "isActive"],

      properties: {
        id: { type: "integer" },
        email: { type: "string", format: "email" },
        firstName: { type: "string", minLength: 1, maxLength: 255 },
        lastName: { type: ["string", "null"], default: null },
        password: { type: "string", minLength: 1, maxLength: 255 },
        role: { type: "string", enum: Object.values(UserRole) },
        isActive: { type: "boolean" },
      },
    };
  }

  static override get columnNameMappers() {
    return {
      parse: (json: any) => {
        return {
          id: json.id,
          email: json.email,
          firstName: json.first_name,
          lastName: json.last_name,
          password: json.password,
          role: json.role,
          isActive: json.is_active,
          createdAt: json.created_at,
          updatedAt: json.updated_at,
        };
      },
      format: (json: any) => {
        return {
          id: json.id,
          email: json.email,
          first_name: json.firstName,
          last_name: json.lastName,
          password: json.password,
          role: json.role,
          is_active: json.isActive,
          created_at: json.createdAt,
          updated_at: json.updatedAt,
        };
      },
    };
  }

  static override get relationMappings() {
    return {
      tasksCreated: {
        relation: Model.HasManyRelation,
        modelClass: Task,
        join: {
          from: "users.id",
          to: "tasks.created_by",
        },
      },
      tasksAssigned: {
        relation: Model.HasManyRelation,
        modelClass: Task,
        join: {
          from: "users.id",
          to: "tasks.assigned_to_id",
        },
      },
    };
  }
}
