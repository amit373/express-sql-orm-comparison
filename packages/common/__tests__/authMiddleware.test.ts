import { Request, Response, NextFunction } from "express";
import {
  createAuthMiddleware,
  authenticate,
  authorize,
  AuthRequest,
} from "../middlewares/authMiddleware";
import { TokenService } from "../token";
import { UnauthorizedException } from "../errors";
import { UserRole } from "@packages/types";

// Mock the dependencies
jest.mock("../token");
jest.mock("../errors");

const mockedTokenService = TokenService as jest.Mocked<typeof TokenService>;
const mockedUnauthorizedException = UnauthorizedException as jest.Mocked<
  typeof UnauthorizedException
>;

// Mock Express objects
const createMockRequest = (props: any = {}): Partial<AuthRequest> => ({
  headers: {},
  ...props,
});

const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

const mockNext: NextFunction = jest.fn();

describe("Auth Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAuthMiddleware", () => {
    it("should throw UnauthorizedException if no token is provided", async () => {
      const mockReq = createMockRequest({ headers: {} });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const middleware = createAuthMiddleware();
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedException("Access token is required"),
      );
    });

    it("should throw UnauthorizedException if token format is invalid", async () => {
      const mockReq = createMockRequest({
        headers: { authorization: "InvalidToken" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const middleware = createAuthMiddleware();
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedException("Access token is required"),
      );
    });

    it("should verify token and attach user info to request", async () => {
      const mockReq = createMockRequest({
        headers: { authorization: "Bearer valid-token" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const mockTokenPayload = {
        userId: 1,
        email: "test@example.com",
        role: UserRole.USER,
      };

      mockedTokenService.verifyToken.mockReturnValue(mockTokenPayload);

      const middleware = createAuthMiddleware();
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockedTokenService.verifyToken).toHaveBeenCalledWith(
        "valid-token",
      );
      expect((mockReq as AuthRequest).userId).toBe(1);
      expect((mockReq as AuthRequest).email).toBe("test@example.com");
      expect((mockReq as AuthRequest).role).toBe(UserRole.USER);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should throw UnauthorizedException for invalid token", async () => {
      const mockReq = createMockRequest({
        headers: { authorization: "Bearer invalid-token" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      mockedTokenService.verifyToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });
      mockedUnauthorizedException.mockImplementation((message) => {
        return new Error(message) as UnauthorizedException;
      });

      const middleware = createAuthMiddleware();
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedException("Invalid or expired token"),
      );
    });

    it("should verify user existence when findUserById is provided", async () => {
      const mockReq = createMockRequest({
        headers: { authorization: "Bearer valid-token" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const mockTokenPayload = {
        userId: 1,
        email: "test@example.com",
        role: UserRole.USER,
      };

      mockedTokenService.verifyToken.mockReturnValue(mockTokenPayload);

      const mockUserFinder = jest.fn().mockResolvedValue({
        id: 1,
        isActive: true,
      });

      const middleware = createAuthMiddleware(mockUserFinder);
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockUserFinder).toHaveBeenCalledWith(1);
      expect((mockReq as AuthRequest).userId).toBe(1);
      expect((mockReq as AuthRequest).email).toBe("test@example.com");
      expect((mockReq as AuthRequest).role).toBe(UserRole.USER);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should throw UnauthorizedException if user does not exist", async () => {
      const mockReq = createMockRequest({
        headers: { authorization: "Bearer valid-token" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const mockTokenPayload = {
        userId: 1,
        email: "test@example.com",
        role: UserRole.USER,
      };

      mockedTokenService.verifyToken.mockReturnValue(mockTokenPayload);

      const mockUserFinder = jest.fn().mockResolvedValue(null);

      const middleware = createAuthMiddleware(mockUserFinder);
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedException("User no longer exists"),
      );
    });

    it("should throw UnauthorizedException if user is inactive", async () => {
      const mockReq = createMockRequest({
        headers: { authorization: "Bearer valid-token" },
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const mockTokenPayload = {
        userId: 1,
        email: "test@example.com",
        role: UserRole.USER,
      };

      mockedTokenService.verifyToken.mockReturnValue(mockTokenPayload);

      const mockUserFinder = jest.fn().mockResolvedValue({
        id: 1,
        isActive: false,
      });

      const middleware = createAuthMiddleware(mockUserFinder);
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedException("User account is inactive"),
      );
    });
  });

  describe("authenticate", () => {
    it("should be an instance of the auth middleware without user verification", () => {
      expect(authenticate).toBeInstanceOf(Function);
    });
  });

  describe("authorize", () => {
    it("should call next if user has required role", () => {
      const mockReq = createMockRequest({
        role: UserRole.ADMIN,
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const authMiddleware = authorize(UserRole.ADMIN);
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should throw UnauthorizedException if user has no role", () => {
      const mockReq = createMockRequest({});
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const authMiddleware = authorize(UserRole.ADMIN);
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedException("Access denied"),
      );
    });

    it("should throw UnauthorizedException if user has insufficient permissions", () => {
      const mockReq = createMockRequest({
        role: UserRole.USER,
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const authMiddleware = authorize(UserRole.ADMIN);
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedException("Insufficient permissions"),
      );
    });

    it("should allow access if user has one of the required roles", () => {
      const mockReq = createMockRequest({
        role: UserRole.USER,
      });
      const mockRes = createMockResponse();
      const mockNext = jest.fn();

      const authMiddleware = authorize(UserRole.ADMIN, UserRole.USER);
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
