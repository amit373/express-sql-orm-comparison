import { z } from "zod";

/**
 * Validation middleware function that validates request data against a Zod schema.
 *
 * @param schema - The Zod schema to validate against
 * @returns A middleware function that validates request data
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          message: "Validation failed",
          errors,
        });
      }
      next(error);
    }
  };
};

/**
 * Schema for validating pagination parameters.
 */
export const paginationSchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => {
      const num = Number(val);
      return Math.min(Math.max(num, 1), 100); // Max 100 per page
    }),
});

/**
 * Schema for validating ID parameters.
 */
export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
});

/**
 * Schema for validating environment variables.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .default("postgresql://postgres:password@localhost:5432/orm_comparison"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .default("http"),
});

export type EnvSchema = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the envSchema.
 *
 * @returns The validated environment variables
 */
export const validateEnv = (): EnvSchema => {
  try {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error("❌ Invalid environment variables:");
      console.error(parsed.error.flatten().fieldErrors);

      throw new Error("Invalid environment variables");
    }

    return parsed.data;
  } catch (error) {
    console.error("Environment validation failed:", error);
    process.exit(1);
  }
};

/**
 * Auth Schemas
 */
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().optional(),
  }),
});

/**
 * Schema for validating login requests.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

/**
 * Schema for validating refresh token requests.
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

/**
 * User Schemas
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

/**
 * Schema for validating password change requests.
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
  }),
});

/**
 * Schema for validating user role update requests.
 */
export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
  body: z.object({
    role: z.enum(["ADMIN", "MANAGER", "USER"]),
  }),
});

/**
 * Schema for validating user status update requests.
 */
export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

/**
 * Task Schemas
 */
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.string().datetime().optional(),
    assignedToId: z.number().optional(),
  }),
});

/**
 * Schema for validating task update requests.
 */
export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

/**
 * Schema for validating task status update requests.
 */
export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
  body: z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  }),
});

/**
 * Schema for validating task priority update requests.
 */
export const updateTaskPrioritySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
  body: z.object({
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  }),
});

/**
 * Schema for validating task assignment requests.
 */
export const assignTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
  body: z.object({
    assigneeId: z.number(),
  }),
});

/**
 * Additional Task Schemas
 */
export const updateTaskDueDateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),
  body: z.object({
    dueDate: z.string().datetime(),
  }),
});
