import jwt from "jsonwebtoken";
import { User, UserRole } from "@packages/types";
import config from "@packages/config";
import { TokenService, TokenPayload } from "../token";
import { UnauthorizedException } from "../errors";

// Mock the dependencies
jest.mock("jsonwebtoken");
jest.mock("@packages/config");

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedConfig = config as jest.Mocked<typeof config>;

describe("TokenService", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    password: "hashedPassword",
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokenPayload: TokenPayload = {
    userId: 1,
    email: "test@example.com",
    role: UserRole.USER,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedConfig.jwt = {
      secret: "test-secret",
    };
  });

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      mockedJwt.sign.mockReturnValue("mocked-token");

      const token = TokenService.generateToken(mockUser);

      expect(token).toBe("mocked-token");
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        mockTokenPayload,
        "test-secret",
        { expiresIn: "24h" },
      );
    });

    it("should use correct payload structure", () => {
      mockedJwt.sign.mockReturnValue("mocked-token");

      TokenService.generateToken(mockUser);

      const expectedPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expectedPayload,
        "test-secret",
        { expiresIn: "24h" },
      );
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      mockedJwt.sign.mockReturnValue("mocked-refresh-token");

      const token = TokenService.generateRefreshToken(mockUser);

      expect(token).toBe("mocked-refresh-token");
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        mockTokenPayload,
        "test-secret",
        { expiresIn: "7d" },
      );
    });

    it("should use correct payload structure for refresh token", () => {
      mockedJwt.sign.mockReturnValue("mocked-refresh-token");

      TokenService.generateRefreshToken(mockUser);

      const expectedPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expectedPayload,
        "test-secret",
        { expiresIn: "7d" },
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token and return the payload", () => {
      mockedJwt.verify.mockReturnValue(mockTokenPayload);

      const result = TokenService.verifyToken("valid-token");

      expect(result).toEqual(mockTokenPayload);
      expect(mockedJwt.verify).toHaveBeenCalledWith(
        "valid-token",
        "test-secret",
      );
    });

    it("should throw UnauthorizedException for invalid token", () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => TokenService.verifyToken("invalid-token")).toThrow(
        UnauthorizedException,
      );
      expect(() => TokenService.verifyToken("invalid-token")).toThrow(
        "Invalid or expired token",
      );
    });

    it("should throw UnauthorizedException for expired token", () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error("Token expired");
      });

      expect(() => TokenService.verifyToken("expired-token")).toThrow(
        UnauthorizedException,
      );
      expect(() => TokenService.verifyToken("expired-token")).toThrow(
        "Invalid or expired token",
      );
    });
  });
});
