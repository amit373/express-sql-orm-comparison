import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Task } from "./Task";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar", name: "first_name" })
  firstName: string;

  @Column({ type: "varchar", name: "last_name", nullable: true })
  lastName?: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({
    type: "enum",
    enum: ["ADMIN", "MANAGER", "USER"],
    default: "USER",
  })
  role: string;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Task, (task) => task.creator)
  tasksCreated: Task[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  tasksAssigned: Task[];
}
