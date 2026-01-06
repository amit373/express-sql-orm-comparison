import "dotenv/config";
import "reflect-metadata";
import express, { Application } from "express";
import config from "@packages/config";
import {
  globalErrorHandler,
  sanitizeMiddleware,
  notFoundRoute,
} from "@packages/common";
import setupSwagger from "@packages/swagger";
import logger, { requestLoggerMiddleware } from "@packages/logger";
import { initializeDatabase } from "./config/database";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";

// Initialize express app
const app: Application = express();

// Middleware
app.use(requestLoggerMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);

// Health check endpoint
app.get("/health", (_, res) => {
  return res.status(200).json({
    success: true,
    message: "TypeORM App is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/tasks", taskRoutes);

app.use("/api", apiRouter);

// Setup Swagger
setupSwagger(app);

// Error handling middleware should be last
app.use(globalErrorHandler);
app.use(notFoundRoute);

// Initialize database and start server
const port = config.port;

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      logger.info(`TypeORM app listening at http://localhost:${port}`);
      logger.info(`Documentation available at http://localhost:${port}/docs`);
    });
  })
  .catch((error) => {
    logger.error("Failed to initialize database:", error);
    process.exit(1);
  });

export default app;
