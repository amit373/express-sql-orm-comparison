// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// Error Messages
export const ERROR_MESSAGES = {
  // Generic
  INTERNAL_SERVER_ERROR: "Internal server error",
  NOT_FOUND: "Resource not found",
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",

  // Validation
  VALIDATION_ERROR: "Validation failed",
  INVALID_INPUT: "Invalid input provided",

  // Database
  DATABASE_ERROR: "Database error occurred",
  DUPLICATE_ENTRY: "Duplicate entry found",

  // Authentication
  INVALID_CREDENTIALS: "Invalid credentials",
  TOKEN_EXPIRED: "Token has expired",
  TOKEN_INVALID: "Invalid token",

  // User
  USER_NOT_FOUND: "User not found",

  // Task
  TASK_NOT_FOUND: "Task not found",
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  USER_REGISTERED_SUCCESSFULLY: "User registered successfully",
  LOGIN_SUCCESSFUL: "Login successful",
  TOKEN_REFRESHED_SUCCESSFULLY: "Token refreshed successfully",
  LOGOUT_SUCCESSFUL: "Logout successful",

  // User
  USER_CREATED_SUCCESSFULLY: "User created successfully",
  USER_RETRIEVED_SUCCESSFULLY: "User retrieved successfully",
  USERS_RETRIEVED_SUCCESSFULLY: "Users retrieved successfully",
  USER_UPDATED_SUCCESSFULLY: "User updated successfully",
  USER_DELETED_SUCCESSFULLY: "User deleted successfully",

  // Task
  TASK_CREATED_SUCCESSFULLY: "Task created successfully",
  TASK_RETRIEVED_SUCCESSFULLY: "Task retrieved successfully",
  TASKS_RETRIEVED_SUCCESSFULLY: "Tasks retrieved successfully",
  TASK_UPDATED_SUCCESSFULLY: "Task updated successfully",
  TASK_DELETED_SUCCESSFULLY: "Task deleted successfully",
  TASK_ASSIGNED_SUCCESSFULLY: "Task assigned successfully",
} as const;

// App-wide constants
export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
  DEFAULT_PAGE: 1,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;
