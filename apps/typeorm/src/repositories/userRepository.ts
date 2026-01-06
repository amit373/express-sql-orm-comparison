import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { User as TypeOrmUser } from "../entities/User";
import { User, UserRole } from "@packages/types";

export class UserRepository {
  private readonly repository: Repository<TypeOrmUser> =
    AppDataSource.getRepository(TypeOrmUser);

  async create(userData: Partial<User>): Promise<User> {
    const user = new TypeOrmUser();
    user.email = userData.email!;
    user.firstName = userData.firstName!;
    user.lastName = userData.lastName || "";
    user.isActive = userData.isActive ?? true;
    user.password = userData.password!;
    user.role = userData.role || UserRole.USER;

    const savedUser = await this.repository.save(user);
    return this.mapToUser(savedUser);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { id, isActive: true },
    });
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { email, isActive: true },
    });
    return user ? this.mapToUser(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.repository.find({ where: { isActive: true } });
    return users.map((user) => this.mapToUser(user));
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }

    Object.assign(user, userData);
    const updatedUser = await this.repository.save(user);
    return this.mapToUser(updatedUser);
  }

  async delete(id: number): Promise<void> {
    const user = await this.repository.findOne({ where: { id } });
    if (user) {
      user.isActive = false; // Soft delete
      await this.repository.save(user);
    }
  }

  private mapToUser(typeOrmUser: TypeOrmUser): User {
    return {
      id: typeOrmUser.id,
      email: typeOrmUser.email,
      firstName: typeOrmUser.firstName,
      lastName: typeOrmUser.lastName || "",
      isActive: typeOrmUser.isActive,
      createdAt: typeOrmUser.createdAt,
      updatedAt: typeOrmUser.updatedAt,
      password: typeOrmUser.password,
      role: typeOrmUser.role as UserRole,
    };
  }
}
