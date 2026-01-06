import { User } from "./User";
import { Task } from "./Task";

// Set up associations
User.associate({ Task });
Task.associate({ User });

export { User, Task };