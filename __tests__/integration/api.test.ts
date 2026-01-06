import request from "supertest";
import { app } from "../../apps/drizzle/src/index";

describe("API Integration Tests", () => {
  describe("User Routes", () => {
    it("should register a new user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.email).toBe(userData.email);
    });

    it("should login a user", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
    });

    it("should get all users", async () => {
      const response = await request(app).get("/api/users").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("Task Routes", () => {
    let authToken: string;
    let userId: number;

    beforeAll(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post("/api/users/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      authToken = loginResponse.body.data.token;
      userId = loginResponse.body.data.user.id;
    });

    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "HIGH",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe(taskData.title);
    });

    it("should get user tasks", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
