import { Request, Response, NextFunction } from "express";
import { UserController } from "../src/controllers/userController";
import { UserService } from "../src/services";
import { successResponse, errorResponse } from "@packages/common";

// Mock the UserService
jest.mock("../src/services", () => ({
  UserService: jest.fn().mockImplementation(() => ({
    createUser: jest.fn(),
    getUserById: jest.fn(),
    getAllUsers: jest.fn(),
    updateUser: jest.fn(),
    changePassword: jest.fn(),
    updateUserRole: jest.fn(),
    updateUserStatus: jest.fn(),
    deleteUser: jest.fn(),
  })),
}));

const mockedUserService = new UserService() as jest.Mocked<UserService>;

// Mock Express objects
const createMockRequest = (props: any = {}): Partial<Request> => ({
  body: {},
  query: {},
  params: {},
  ...props,
});

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const mockNext: NextFunction = jest.fn();

describe("UserController", () => {
  let userController: UserController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    userController = new UserController();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user and return success response", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };
      const createdUser = {
        id: 1,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.body = userData;
      (mockedUserService.createUser as jest.Mock).mockResolvedValue(
        createdUser,
      );

      await userController.createUser(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("User created successfully", createdUser, 201),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should retrieve a user by ID and return success response", async () => {
      const userId = "1";
      const user = {
        id: 1,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.params = { id: userId };
      (mockedUserService.getUserById as jest.Mock).mockResolvedValue(user);

      await userController.getUserById(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("User retrieved successfully", user),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getAllUsers", () => {
    it("should retrieve all users and return success response", async () => {
      const users = [
        {
          id: 1,
          email: "test1@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "USER",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: "test2@example.com",
          firstName: "Jane",
          lastName: "Smith",
          role: "USER",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockedUserService.getAllUsers as jest.Mock).mockResolvedValue(users);

      await userController.getAllUsers(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.getAllUsers).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("Users retrieved successfully", users),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getProfile", () => {
    it("should retrieve the authenticated user's profile", async () => {
      const userId = 1;
      const user = {
        id: 1,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockReq as any).userId = userId;
      (mockedUserService.getUserById as jest.Mock).mockResolvedValue(user);

      await userController.getProfile(
        mockReq as any,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("User retrieved successfully", user),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("updateProfile", () => {
    it("should update the authenticated user's profile", async () => {
      const userId = 1;
      const updateData = { firstName: "Updated", lastName: "Name" };
      const updatedUser = {
        id: 1,
        email: "test@example.com",
        firstName: "Updated",
        lastName: "Name",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockReq as any).userId = userId;
      mockReq.body = updateData;
      (mockedUserService.updateUser as jest.Mock).mockResolvedValue(
        updatedUser,
      );

      await userController.updateProfile(
        mockReq as any,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.updateUser).toHaveBeenCalledWith(
        userId,
        updateData,
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("User updated successfully", updatedUser),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    it("should change the authenticated user's password", async () => {
      const userId = 1;
      const newPassword = "newPassword123";

      (mockReq as any).userId = userId;
      mockReq.body = { newPassword };

      (mockedUserService.changePassword as jest.Mock).mockResolvedValue(
        undefined,
      );

      await userController.changePassword(
        mockReq as any,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.changePassword).toHaveBeenCalledWith(
        userId,
        newPassword,
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("Password changed successfully"),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update a user by ID", async () => {
      const userId = "1";
      const updateData = { firstName: "Updated", lastName: "Name" };
      const updatedUser = {
        id: 1,
        email: "test@example.com",
        firstName: "Updated",
        lastName: "Name",
        role: "USER",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.params = { id: userId };
      mockReq.body = updateData;
      (mockedUserService.updateUser as jest.Mock).mockResolvedValue(
        updatedUser,
      );

      await userController.updateUser(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("User updated successfully", updatedUser),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("updateUserRole", () => {
    it("should update a user's role", async () => {
      const userId = "1";
      const role = "ADMIN";
      const updatedUser = {
        id: 1,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "ADMIN",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.params = { id: userId };
      mockReq.body = { role };
      (mockedUserService.updateUserRole as jest.Mock).mockResolvedValue(
        updatedUser,
      );

      await userController.updateUserRole(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.updateUserRole).toHaveBeenCalledWith(1, role);
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("User role updated successfully", updatedUser),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("updateUserStatus", () => {
    it("should update a user's status", async () => {
      const userId = "1";
      const isActive = false;
      const updatedUser = {
        id: 1,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "USER",
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReq.params = { id: userId };
      mockReq.body = { isActive };
      (mockedUserService.updateUserStatus as jest.Mock).mockResolvedValue(
        updatedUser,
      );

      await userController.updateUserStatus(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.updateUserStatus).toHaveBeenCalledWith(
        1,
        isActive,
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("User status updated successfully", updatedUser),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and return success response", async () => {
      const userId = "1";

      mockReq.params = { id: userId };
      (mockedUserService.deleteUser as jest.Mock).mockResolvedValue(true);

      await userController.deleteUser(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(
        successResponse("User deleted successfully"),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 404 when user to delete is not found", async () => {
      const userId = "1";

      mockReq.params = { id: userId };
      (mockedUserService.deleteUser as jest.Mock).mockResolvedValue(false);

      await userController.deleteUser(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockedUserService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        errorResponse("User not found", 404),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
