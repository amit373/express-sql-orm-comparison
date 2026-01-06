import {
  validate,
  paginationSchema,
  idParamSchema,
  envSchema,
  validateEnv,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateUserSchema,
  changePasswordSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskPrioritySchema,
  assignTaskSchema,
  updateTaskDueDateSchema,
} from "../index";
import { z } from "zod";

// Mock Express objects
const createMockRequest = (props: any = {}): any => ({
  body: {},
  query: {},
  params: {},
  ...props,
});

const createMockResponse = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const mockNext = jest.fn();

describe("Validation Package", () => {
  describe("validate middleware", () => {
    it("should call next when validation passes", () => {
      const mockReq = createMockRequest({
        body: { email: "test@example.com", password: "password123" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
      });

      const middleware = validate(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should return error response when validation fails", () => {
      const mockReq = createMockRequest({
        body: { email: "invalid-email", password: "123" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const schema = z.object({
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
      });

      const middleware = validate(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: [
          { field: "body.email", message: "Invalid email" },
          {
            field: "body.password",
            message: "String must contain at least 6 character(s)",
          },
        ],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle validation errors with nested paths", () => {
      const mockReq = createMockRequest({
        body: { user: { name: "" } },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const schema = z.object({
        body: z.object({
          user: z.object({
            name: z.string().min(1),
          }),
        }),
      });

      const middleware = validate(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: [
          {
            field: "body.user.name",
            message: "String must contain at least 1 character(s)",
          },
        ],
      });
    });

    it("should validate query and params as well as body", () => {
      const mockReq = createMockRequest({
        body: { name: "John" },
        query: { page: "1" },
        params: { id: "123" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const schema = z.object({
        body: z.object({ name: z.string() }),
        query: z.object({ page: z.string() }),
        params: z.object({ id: z.string() }),
      });

      const middleware = validate(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("paginationSchema", () => {
    it("should validate pagination parameters", () => {
      const result = paginationSchema.safeParse({
        page: "2",
        limit: "20",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should use default values when parameters are not provided", () => {
      const result = paginationSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should limit max page size to 100", () => {
      const result = paginationSchema.safeParse({
        limit: "150",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(100);
      }
    });
  });

  describe("idParamSchema", () => {
    it("should validate valid ID parameter", () => {
      const result = idParamSchema.safeParse({
        params: { id: "123" },
      });

      expect(result.success).toBe(true);
    });

    it("should reject non-numeric ID parameter", () => {
      const result = idParamSchema.safeParse({
        params: { id: "abc" },
      });

      expect(result.success).toBe(false);
    });

    it("should require ID parameter", () => {
      const result = idParamSchema.safeParse({
        params: {},
      });

      expect(result.success).toBe(false);
    });
  });

  describe("envSchema", () => {
    it("should validate environment variables", () => {
      const validEnv = {
        NODE_ENV: "production",
        PORT: "3000",
        DATABASE_URL: "postgresql://localhost:5432/test",
        JWT_SECRET: "secret123",
        LOG_LEVEL: "info",
      };

      const result = envSchema.safeParse(validEnv);

      expect(result.success).toBe(true);
    });

    it("should provide default values for optional environment variables", () => {
      const minimalEnv = {
        DATABASE_URL: "postgresql://localhost:5432/test",
        JWT_SECRET: "secret123",
      };

      const result = envSchema.safeParse(minimalEnv);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe("development");
        expect(result.data.PORT).toBe(3000);
        expect(result.data.LOG_LEVEL).toBe("http");
      }
    });

    it("should reject invalid environment variables", () => {
      const invalidEnv = {
        NODE_ENV: "invalid",
        PORT: "3000",
        DATABASE_URL: "postgresql://localhost:5432/test",
        JWT_SECRET: "secret123",
      };

      const result = envSchema.safeParse(invalidEnv);

      expect(result.success).toBe(false);
    });
  });

  describe("Auth Schemas", () => {
    describe("registerSchema", () => {
      it("should validate valid registration data", () => {
        const result = registerSchema.safeParse({
          body: {
            email: "test@example.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
          },
        });

        expect(result.success).toBe(true);
      });

      it("should reject invalid email", () => {
        const result = registerSchema.safeParse({
          body: {
            email: "invalid-email",
            password: "password123",
            firstName: "John",
          },
        });

        expect(result.success).toBe(false);
      });

      it("should reject short password", () => {
        const result = registerSchema.safeParse({
          body: {
            email: "test@example.com",
            password: "123",
            firstName: "John",
          },
        });

        expect(result.success).toBe(false);
      });

      it("should require firstName", () => {
        const result = registerSchema.safeParse({
          body: {
            email: "test@example.com",
            password: "password123",
          },
        });

        expect(result.success).toBe(false);
      });
    });

    describe("loginSchema", () => {
      it("should validate valid login data", () => {
        const result = loginSchema.safeParse({
          body: {
            email: "test@example.com",
            password: "password123",
          },
        });

        expect(result.success).toBe(true);
      });

      it("should reject invalid email", () => {
        const result = loginSchema.safeParse({
          body: {
            email: "invalid-email",
            password: "password123",
          },
        });

        expect(result.success).toBe(false);
      });

      it("should require both email and password", () => {
        const result = loginSchema.safeParse({
          body: {
            email: "test@example.com",
          },
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("User Schemas", () => {
    describe("updateUserSchema", () => {
      it("should validate valid update user data", () => {
        const result = updateUserSchema.safeParse({
          params: { id: "123" },
          body: {
            firstName: "Updated",
            lastName: "Name",
          },
        });

        expect(result.success).toBe(true);
      });

      it("should allow partial updates", () => {
        const result = updateUserSchema.safeParse({
          params: { id: "123" },
          body: {
            firstName: "Updated",
          },
        });

        expect(result.success).toBe(true);
      });
    });

    describe("updateUserRoleSchema", () => {
      it("should validate valid role update", () => {
        const result = updateUserRoleSchema.safeParse({
          params: { id: "123" },
          body: {
            role: "ADMIN",
          },
        });

        expect(result.success).toBe(true);
      });

      it("should reject invalid role", () => {
        const result = updateUserRoleSchema.safeParse({
          params: { id: "123" },
          body: {
            role: "INVALID_ROLE",
          },
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("Task Schemas", () => {
    describe("createTaskSchema", () => {
      it("should validate valid task creation data", () => {
        const result = createTaskSchema.safeParse({
          body: {
            title: "Test Task",
            description: "Description",
            priority: "HIGH",
            dueDate: "2023-12-31T23:59:59.000Z",
            assignedToId: 1,
          },
        });

        expect(result.success).toBe(true);
      });

      it("should require title", () => {
        const result = createTaskSchema.safeParse({
          body: {
            description: "Description",
          },
        });

        expect(result.success).toBe(false);
      });

      it("should validate priority enum", () => {
        const result = createTaskSchema.safeParse({
          body: {
            title: "Test Task",
            priority: "INVALID_PRIORITY",
          },
        });

        expect(result.success).toBe(false);
      });
    });

    describe("updateTaskStatusSchema", () => {
      it("should validate valid status update", () => {
        const result = updateTaskStatusSchema.safeParse({
          params: { id: "123" },
          body: {
            status: "COMPLETED",
          },
        });

        expect(result.success).toBe(true);
      });

      it("should reject invalid status", () => {
        const result = updateTaskStatusSchema.safeParse({
          params: { id: "123" },
          body: {
            status: "INVALID_STATUS",
          },
        });

        expect(result.success).toBe(false);
      });
    });
  });
});
