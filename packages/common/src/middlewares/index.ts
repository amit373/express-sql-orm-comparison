import { Request, Response, NextFunction } from "express";
import { BaseException } from "../errors";
import { errorResponse } from "../responses";

export * from "./authMiddleware";

/**
 * Async handler to wrap async route handlers and catch errors.
 *
 * @param fn - The async function to wrap
 * @returns A function that handles async errors by passing them to the next middleware
 */
export const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Global error handler middleware that processes errors and sends appropriate responses.
 *
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns The error response
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If error is an instance of BaseException, use its properties
  if (err instanceof BaseException) {
    return res
      .status(err.statusCode)
      .json(
        errorResponse(
          err.message,
          err.statusCode,
          err.details ? [err.details] : undefined,
          err.stack,
        ),
      );
  }

  // Handle validation errors (e.g., from express-validator or similar)
  if (err.name === "ValidationError" || err.isJoi) {
    return res
      .status(400)
      .json(
        errorResponse("Validation Error", 400, [
          { message: err.message || "Validation failed" },
        ]),
      );
  }

  // Handle duplicate key errors (e.g., from MongoDB or SQL)
  if (
    err.code === 11000 ||
    err.code === "ER_DUP_ENTRY" ||
    err.code === "SQLITE_CONSTRAINT"
  ) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res
      .status(409)
      .json(errorResponse(`Duplicate entry for ${field}`, 409));
  }

  // Handle cast errors (e.g., invalid ObjectId in MongoDB)
  if (err.name === "CastError") {
    return res.status(400).json(errorResponse("Invalid ID format", 400));
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Internal server error"
      : err.message || "Something went wrong";

  return res
    .status(statusCode)
    .json(errorResponse(message, statusCode, undefined, err.stack));
};

/**
 * Sanitize middleware to clean user inputs by trimming whitespace and sanitizing nested objects.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const sanitizeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }

  // Sanitize request body
  if (req.body) {
    const sanitizeValue = (value: any): any => {
      if (typeof value === "string") {
        return value.trim();
      } else if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      } else if (value && typeof value === "object") {
        const sanitized: any = {};
        Object.keys(value).forEach((k) => {
          sanitized[k] = sanitizeValue(value[k]);
        });
        return sanitized;
      }
      return value;
    };

    req.body = sanitizeValue(req.body);
  }

  next();
};

/**
 * Not found route handler for handling 404 errors.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns The 404 error response
 */
export const notFoundRoute = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(404).json(errorResponse("Route not found", 404));
};
