import { createAuthMiddleware } from "@packages/common";
import { UserRepository } from "../repositories";

const userRepository = new UserRepository();

export const authenticate = createAuthMiddleware(async (id: number) => {
  const user = await userRepository.findById(id);
  if (!user) return null;

  return {
    id: user.id,
    isActive: user.isActive,
  };
});
