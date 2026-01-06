import { Model, DataTypes } from "sequelize";
import { User as UserInterface, UserRole } from "@packages/types";
import { sequelize } from "../config/database";
import { Task } from "./Task";

// Define User model
class UserModel extends Model<UserInterface> implements UserInterface {
  public id!: number;
  public email!: string;
  public firstName!: string;
  public lastName!: string;
  public password!: string;
  public role!: UserRole;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Define associations
  public tasksCreated?: Task[];
  public tasksAssigned?: Task[];
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "MANAGER", "USER"),
      defaultValue: "USER",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: "users",
    sequelize,
  },
);

export class User extends UserModel {
  static associate(models: any) {
    this.hasMany(models.Task, {
      as: "tasksCreated",
      foreignKey: "createdBy",
      sourceKey: "id",
    });
    this.hasMany(models.Task, {
      as: "tasksAssigned",
      foreignKey: "assignedToId",
      sourceKey: "id",
    });
  }
}
