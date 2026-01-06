import { createAuthMiddleware } from "@packages/common";
import { AppDataSource } from "../config/database";
import { UserRepository } from "../repositories/userRepository";

let userRepository: UserRepository | null = null;

async function getUserRepository(): Promise<UserRepository> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  if (!userRepository) {
    userRepository = new UserRepository();
  }
  
  return userRepository;
}

export const authenticate = createAuthMiddleware(async (id: number) => {
  const repo = await getUserRepository();
  const user = await repo.findById(id);
  if (!user) return null;

  return {
    id: user.id,
    isActive: user.isActive,
  };
});
