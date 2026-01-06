import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    default: "PENDING",
  })
  status: string;

  @Column({
    type: "enum",
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    default: "MEDIUM",
  })
  priority: string;

  @Column({ type: "integer", name: "assigned_to_id" })
  assignedToId: number;

  @Column({ type: "integer", name: "created_by" })
  createdBy: number;

  @ManyToOne(() => User, (user) => user.tasksAssigned)
  @JoinColumn({ name: "assigned_to_id" })
  assignedTo: User;

  @ManyToOne(() => User, (user) => user.tasksCreated)
  @JoinColumn({ name: "created_by" })
  creator: User;

  @Column({ type: "timestamp", name: "completed_at", nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
