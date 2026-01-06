import { Model, DataTypes } from "sequelize";
import {
  Task as TaskInterface,
  TaskStatus,
  TaskPriority,
} from "@packages/types";
import { sequelize } from "../config/database";
import { User } from "./User";

// Define Task model
export class TaskModel extends Model<TaskInterface> implements TaskInterface {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: TaskStatus;
  public priority!: TaskPriority;
  public assignedToId!: number;
  public createdBy!: number;
  public completedAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Define associations
  public assignedTo?: User;
  public creator?: User;
}

TaskModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"),
      defaultValue: "PENDING",
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
      defaultValue: "MEDIUM",
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "tasks",
    sequelize,
  },
);

export class Task extends TaskModel {
  static associate(models: any) {
    this.belongsTo(models.User, {
      as: "creator",
      foreignKey: "createdBy",
      targetKey: "id",
    });
    this.belongsTo(models.User, {
      as: "assignedTo",
      foreignKey: "assignedToId",
      targetKey: "id",
    });
  }
}
