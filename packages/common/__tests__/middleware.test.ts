import { Request, Response, NextFunction } from "express";
import {
  asyncHandler,
  globalErrorHandler,
  sanitizeMiddleware,
  notFoundRoute,
} from "../middlewares";
import { BaseException } from "../errors";
import { errorResponse } from "../responses";

// Mock Express objects
const createMockRequest = (props: any = {}): Partial<Request> => ({
  query: {},
  body: {},
  headers: {},
  ...props,
});

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

const mockNext: NextFunction = jest.fn();

describe("Middleware Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("asyncHandler", () => {
    it("should handle async functions without errors", async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error when async function throws", async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const testError = new Error("Test error");

      const asyncFn = jest.fn().mockRejectedValue(testError);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });

  describe("globalErrorHandler", () => {
    it("should handle BaseException with proper status code", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const baseException = new BaseException(
        "Test error",
        400,
        true,
        undefined,
        { field: "value" },
      );

      globalErrorHandler(
        baseException,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse(
          "Test error",
          400,
          [{ field: "value" }],
          baseException.stack,
        ),
      );
    });

    it("should handle validation errors", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const validationError = {
        name: "ValidationError",
        message: "Validation failed",
      };

      globalErrorHandler(
        validationError,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse("Validation Error", 400, [
          { message: "Validation failed" },
        ]),
      );
    });

    it("should handle Joi validation errors", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const joiError = { isJoi: true, message: "Joi validation failed" };

      globalErrorHandler(
        joiError,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse("Validation Error", 400, [
          { message: "Joi validation failed" },
        ]),
      );
    });

    it("should handle duplicate key errors", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const duplicateError = {
        code: "ER_DUP_ENTRY",
        keyValue: { email: "test@example.com" },
      };

      globalErrorHandler(
        duplicateError,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse("Duplicate entry for email", 409),
      );
    });

    it("should handle MongoDB duplicate key errors", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const duplicateError = {
        code: 11000,
        keyValue: { username: "testuser" },
      };

      globalErrorHandler(
        duplicateError,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse("Duplicate entry for username", 409),
      );
    });

    it("should handle cast errors", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const castError = { name: "CastError", message: "Cast failed" };

      globalErrorHandler(
        castError,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse("Invalid ID format", 400),
      );
    });

    it("should handle default errors", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const defaultError = new Error("Default error");

      globalErrorHandler(
        defaultError,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse(
          "Internal server error",
          500,
          undefined,
          defaultError.stack,
        ),
      );
    });

    it("should handle errors with custom status codes", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();
      const customError = { statusCode: 422, message: "Custom error" };

      globalErrorHandler(
        customError,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse("Custom error", 422, undefined, customError.stack),
      );
    });
  });

  describe("sanitizeMiddleware", () => {
    it("should sanitize query parameters", () => {
      const mockReq = createMockRequest({
        query: { name: "  John  ", email: "  test@example.com  " },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query).toEqual({
        name: "John",
        email: "test@example.com",
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should sanitize request body", () => {
      const mockReq = createMockRequest({
        body: {
          name: "  Jane  ",
          email: "  jane@example.com  ",
          nested: {
            description: "  Some text  ",
          },
          array: ["  item1  ", "  item2  "],
        },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body).toEqual({
        name: "Jane",
        email: "jane@example.com",
        nested: {
          description: "Some text",
        },
        array: ["item1", "item2"],
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle null and undefined values", () => {
      const mockReq = createMockRequest({
        body: {
          name: null,
          email: undefined,
          description: "",
        },
        query: { id: null, status: undefined },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body).toEqual({
        name: null,
        email: undefined,
        description: "",
      });
      expect(mockReq.query).toEqual({
        id: null,
        status: undefined,
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle empty objects and arrays", () => {
      const mockReq = createMockRequest({
        body: {
          emptyObj: {},
          emptyArr: [],
        },
        query: {},
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      sanitizeMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body).toEqual({
        emptyObj: {},
        emptyArr: [],
      });
      expect(mockReq.query).toEqual({});
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("notFoundRoute", () => {
    it("should return 404 error response", () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      notFoundRoute(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse("Route not found", 404),
      );
    });
  });
});
