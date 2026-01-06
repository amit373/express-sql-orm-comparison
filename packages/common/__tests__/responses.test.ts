import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../responses";

describe("Response Functions", () => {
  describe("successResponse", () => {
    it("should create a success response with default status code", () => {
      const response = successResponse("Success message");

      expect(response).toEqual({
        success: true,
        message: "Success message",
        statusCode: 200,
      });
    });

    it("should create a success response with data", () => {
      const response = successResponse("Success message", {
        id: 1,
        name: "Test",
      });

      expect(response).toEqual({
        success: true,
        message: "Success message",
        statusCode: 200,
        data: { id: 1, name: "Test" },
      });
    });

    it("should create a success response with custom status code", () => {
      const response = successResponse("Created", undefined, 201);

      expect(response).toEqual({
        success: true,
        message: "Created",
        statusCode: 201,
      });
    });

    it("should create a success response with meta information", () => {
      const response = successResponse("Success message", { id: 1 }, 200, {
        timestamp: "2023-01-01",
      });

      expect(response).toEqual({
        success: true,
        message: "Success message",
        statusCode: 200,
        data: { id: 1 },
        meta: { timestamp: "2023-01-01" },
      });
    });

    it("should handle undefined data correctly", () => {
      const response = successResponse("Success message", undefined);

      expect(response).toEqual({
        success: true,
        message: "Success message",
        statusCode: 200,
      });
      expect(response.data).toBeUndefined();
    });
  });

  describe("errorResponse", () => {
    it("should create an error response with default status code", () => {
      const response = errorResponse("Error message");

      expect(response).toEqual({
        success: false,
        message: "Error message",
        statusCode: 500,
      });
    });

    it("should create an error response with custom status code", () => {
      const response = errorResponse("Error message", 404);

      expect(response).toEqual({
        success: false,
        message: "Error message",
        statusCode: 404,
      });
    });

    it("should include errors array when provided", () => {
      const response = errorResponse("Validation error", 400, [
        { field: "email", message: "Invalid email" },
      ]);

      expect(response).toEqual({
        success: false,
        message: "Validation error",
        statusCode: 400,
        errors: [{ field: "email", message: "Invalid email" }],
      });
    });

    it("should not include errors array when empty", () => {
      const response = errorResponse("Error message", 400, []);

      expect(response).toEqual({
        success: false,
        message: "Error message",
        statusCode: 400,
      });
      expect(response.errors).toBeUndefined();
    });

    it("should include stack trace in development environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const response = errorResponse(
        "Error message",
        500,
        undefined,
        "stack trace",
      );

      expect(response).toEqual({
        success: false,
        message: "Error message",
        statusCode: 500,
        stack: "stack trace",
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should not include stack trace in non-development environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const response = errorResponse(
        "Error message",
        500,
        undefined,
        "stack trace",
      );

      expect(response).toEqual({
        success: false,
        message: "Error message",
        statusCode: 500,
      });
      expect(response.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("paginatedResponse", () => {
    it("should create a paginated response with correct pagination metadata", () => {
      const response = paginatedResponse(
        [{ id: 1, name: "Test" }],
        1,
        10,
        50,
        "Success",
      );

      expect(response).toEqual({
        success: true,
        message: "Success",
        statusCode: 200,
        data: [{ id: 1, name: "Test" }],
        meta: {
          pagination: {
            currentPage: 1,
            totalPages: 5,
            pageSize: 10,
            totalItems: 50,
            hasNextPage: true,
            hasPrevPage: false,
          },
        },
      });
    });

    it("should handle last page correctly", () => {
      const response = paginatedResponse(
        [{ id: 1, name: "Test" }],
        5,
        10,
        50,
        "Success",
      );

      expect(response.meta.pagination).toEqual({
        currentPage: 5,
        totalPages: 5,
        pageSize: 10,
        totalItems: 50,
        hasNextPage: false, // Last page, so no next page
        hasPrevPage: true, // Previous page exists
      });
    });

    it("should handle single page correctly", () => {
      const response = paginatedResponse(
        [{ id: 1, name: "Test" }],
        1,
        10,
        5,
        "Success",
      );

      expect(response.meta.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: 5,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it("should handle empty data", () => {
      const response = paginatedResponse([], 1, 10, 0);

      expect(response).toEqual({
        success: true,
        message: "Success",
        statusCode: 200,
        data: [],
        meta: {
          pagination: {
            currentPage: 1,
            totalPages: 0,
            pageSize: 10,
            totalItems: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
    });

    it("should use default message when not provided", () => {
      const response = paginatedResponse([{ id: 1, name: "Test" }], 1, 10, 50);

      expect(response.message).toBe("Success");
    });
  });
});
