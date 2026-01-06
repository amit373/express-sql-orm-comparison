import {
  HTTP_STATUS,
  BaseException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  InternalServerException,
} from "../errors";

describe("Error Classes", () => {
  describe("HTTP_STATUS", () => {
    it("should contain all expected status codes", () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.ACCEPTED).toBe(202);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.UNPROCESSABLE_ENTITY).toBe(422);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
      expect(HTTP_STATUS.BAD_GATEWAY).toBe(502);
      expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
    });
  });

  describe("BaseException", () => {
    it("should create an instance with provided parameters", () => {
      const error = new BaseException("Test message", 400, true, "stack", {
        test: "value",
      });

      expect(error.message).toBe("Test message");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ test: "value" });
      expect(error.stack).toBe("stack");
      expect(error.name).toBe("BaseException");
    });

    it("should generate stack trace when not provided", () => {
      const error = new BaseException("Test message", 400);

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });

    it("should return JSON representation", () => {
      const error = new BaseException("Test message", 400, true, undefined, {
        test: "value",
      });

      const json = error.toJSON();
      expect(json).toEqual({
        message: "Test message",
        statusCode: 400,
        isOperational: true,
        details: { test: "value" },
      });
    });
  });

  describe("NotFoundException", () => {
    it("should create with default message and status code", () => {
      const error = new NotFoundException();

      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("NotFoundException");
    });

    it("should create with custom message", () => {
      const error = new NotFoundException("Custom message");

      expect(error.message).toBe("Custom message");
      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    });

    it("should accept details", () => {
      const error = new NotFoundException("Test", { field: "value" });

      expect(error.details).toEqual({ field: "value" });
    });
  });

  describe("BadRequestException", () => {
    it("should create with default message and status code", () => {
      const error = new BadRequestException();

      expect(error.message).toBe("Bad request");
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("BadRequestException");
    });

    it("should create with custom message", () => {
      const error = new BadRequestException("Custom message");

      expect(error.message).toBe("Custom message");
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should accept details", () => {
      const error = new BadRequestException("Test", { field: "value" });

      expect(error.details).toEqual({ field: "value" });
    });
  });

  describe("ForbiddenException", () => {
    it("should create with default message and status code", () => {
      const error = new ForbiddenException();

      expect(error.message).toBe("Forbidden");
      expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("ForbiddenException");
    });

    it("should create with custom message", () => {
      const error = new ForbiddenException("Custom message");

      expect(error.message).toBe("Custom message");
      expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    });

    it("should accept details", () => {
      const error = new ForbiddenException("Test", { field: "value" });

      expect(error.details).toEqual({ field: "value" });
    });
  });

  describe("UnauthorizedException", () => {
    it("should create with default message and status code", () => {
      const error = new UnauthorizedException();

      expect(error.message).toBe("Unauthorized");
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("UnauthorizedException");
    });

    it("should create with custom message", () => {
      const error = new UnauthorizedException("Custom message");

      expect(error.message).toBe("Custom message");
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it("should accept details", () => {
      const error = new UnauthorizedException("Test", { field: "value" });

      expect(error.details).toEqual({ field: "value" });
    });
  });

  describe("InternalServerException", () => {
    it("should create with default message and status code", () => {
      const error = new InternalServerException();

      expect(error.message).toBe("Internal server error");
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(error.isOperational).toBe(false);
      expect(error.name).toBe("InternalServerException");
    });

    it("should create with custom message", () => {
      const error = new InternalServerException("Custom message");

      expect(error.message).toBe("Custom message");
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    it("should accept details", () => {
      const error = new InternalServerException("Test", { field: "value" });

      expect(error.details).toEqual({ field: "value" });
    });
  });
});
