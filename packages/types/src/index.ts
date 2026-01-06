// Common types used across the application

/**
 * Base entity interface that provides common fields for all entities.
 */
export interface BaseEntity {
  /** Unique identifier */
  id: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Enum for user roles in the application.
 */
export enum UserRole {
  /** Administrator role */
  ADMIN = "ADMIN",
  /** Manager role */
  MANAGER = "MANAGER",
  /** Regular user role */
  USER = "USER",
}

/**
 * User entity interface representing a user in the system.
 */
export interface User extends BaseEntity {
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name (optional) */
  lastName?: string;
  /** Whether the user account is active */
  isActive: boolean;
  /** User's role */
  role: UserRole;
  /** User's password */
  password: string;
}

/**
 * Task entity interface representing a task in the system.
 */
export interface Task extends BaseEntity {
  /** Task title */
  title: string;
  /** Task description (optional) */
  description?: string;
  /** Task status */
  status: TaskStatus;
  /** Task priority */
  priority: TaskPriority;
  /** ID of the user assigned to the task */
  assignedToId: number;
  /** ID of the user who created the task */
  createdBy: number;
  /** Completion timestamp (optional) */
  completedAt?: Date;
}

/**
 * Enum for task statuses.
 */
export enum TaskStatus {
  /** Task is pending */
  PENDING = "PENDING",
  /** Task is in progress */
  IN_PROGRESS = "IN_PROGRESS",
  /** Task is completed */
  COMPLETED = "COMPLETED",
  /** Task is cancelled */
  CANCELLED = "CANCELLED",
}

/**
 * Enum for task priorities.
 */
export enum TaskPriority {
  /** Low priority */
  LOW = "LOW",
  /** Medium priority */
  MEDIUM = "MEDIUM",
  /** High priority */
  HIGH = "HIGH",
  /** Urgent priority */
  URGENT = "URGENT",
}

/**
 * Product entity interface representing a product in the system.
 */
export interface Product extends BaseEntity {
  /** Product name */
  name: string;
  /** Product description */
  description: string;
  /** Product price */
  price: number;
  /** Product stock quantity */
  stock: number;
  /** Whether the product is active */
  isActive: boolean;
}

/**
 * Order entity interface representing an order in the system.
 */
export interface Order extends BaseEntity {
  /** ID of the user who placed the order */
  userId: number;
  /** Total amount of the order */
  totalAmount: number;
  /** Status of the order */
  status: OrderStatus;
  /** Items in the order */
  items: OrderItem[];
}

/**
 * Order item interface representing an item in an order.
 */
export interface OrderItem {
  /** Unique identifier */
  id: number;
  /** ID of the product */
  productId: number;
  /** Quantity of the product */
  quantity: number;
  /** Price of the product */
  price: number;
}

/**
 * Enum for order statuses.
 */
export enum OrderStatus {
  /** Order is pending */
  PENDING = "pending",
  /** Order is confirmed */
  CONFIRMED = "confirmed",
  /** Order is shipped */
  SHIPPED = "shipped",
  /** Order is delivered */
  DELIVERED = "delivered",
  /** Order is cancelled */
  CANCELLED = "cancelled",
}

/**
 * Interface for pagination metadata.
 */
export interface PaginationMeta {
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
}

/**
 * Interface for API response format.
 */
export interface ApiResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** Response message */
  message: string;
  /** HTTP status code */
  statusCode: number;
  /** Response data (optional) */
  data?: T;
  /** Pagination metadata (optional) */
  meta?: PaginationMeta;
  /** Error details (optional) */
  errors?: any[];
}

/**
 * Interface for request context containing user information.
 */
export interface RequestContext {
  /** User ID (optional) */
  userId?: number;
  /** User email (optional) */
  email?: string;
  /** User role (optional) */
  role?: string;
  /** User permissions (optional) */
  permissions?: string[];
}

/**
 * Interface for database connection configuration.
 */
export interface DatabaseConfig {
  /** Database host */
  host: string;
  /** Database port */
  port: number;
  /** Database username */
  username: string;
  /** Database password */
  password: string;
  /** Database name */
  database: string;
  /** Whether to use SSL (optional) */
  ssl?: boolean;
}

/**
 * Interface for pagination options.
 */
export interface PaginationOptions {
  /** Page number */
  page: number;
  /** Number of items per page */
  limit: number;
}

/**
 * Interface for sorting options.
 */
export interface SortOptions {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: "ASC" | "DESC";
}

/**
 * Interface for filter options.
 */
export interface FilterOptions {
  /** Field to filter by */
  field: string;
  /** Filter operator */
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "like" | "in";
  /** Filter value */
  value: any;
}

/**
 * Interface combining pagination, sorting, and filtering options.
 */
export interface QueryOptions {
  /** Pagination options (optional) */
  pagination?: PaginationOptions;
  /** Sorting options (optional) */
  sort?: SortOptions;
  /** Filter options (optional) */
  filters?: FilterOptions[];
}
