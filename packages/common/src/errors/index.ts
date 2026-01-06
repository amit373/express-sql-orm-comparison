/**
 * HTTP status codes used throughout the application.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/**
 * Base exception class for all custom exceptions in the application.
 */
export class BaseException extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  /**
   * Creates a new BaseException instance.
   *
   * @param message - The error message
   * @param statusCode - The HTTP status code associated with the error
   * @param isOperational - Whether the error is operational (true) or a programming error (false)
   * @param stack - The stack trace for the error
   * @param details - Additional error details
   */
  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    stack?: string,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a JSON representation of the exception.
   *
   * @returns Object containing the exception's message, status code, operational status, and details
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      details: this.details,
    };
  }
}

/**
 * Exception thrown when a requested resource is not found.
 */
export class NotFoundException extends BaseException {
  /**
   * Creates a new NotFoundException instance.
   *
   * @param message - The error message
   * @param details - Additional error details
   */
  constructor(message: string = "Resource not found", details?: any) {
    super(message, HTTP_STATUS.NOT_FOUND, true, undefined, details);
    this.name = this.constructor.name;
  }
}

/**
 * Exception thrown when a request is malformed or invalid.
 */
export class BadRequestException extends BaseException {
  /**
   * Creates a new BadRequestException instance.
   *
   * @param message - The error message
   * @param details - Additional error details
   */
  constructor(message: string = "Bad request", details?: any) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, undefined, details);
    this.name = this.constructor.name;
  }
}

/**
 * Exception thrown when a user doesn't have permission to access a resource.
 */
export class ForbiddenException extends BaseException {
  /**
   * Creates a new ForbiddenException instance.
   *
   * @param message - The error message
   * @param details - Additional error details
   */
  constructor(message: string = "Forbidden", details?: any) {
    super(message, HTTP_STATUS.FORBIDDEN, true, undefined, details);
    this.name = this.constructor.name;
  }
}

/**
 * Exception thrown when a user is not authenticated.
 */
export class UnauthorizedException extends BaseException {
  /**
   * Creates a new UnauthorizedException instance.
   *
   * @param message - The error message
   * @param details - Additional error details
   */
  constructor(message: string = "Unauthorized", details?: any) {
    super(message, HTTP_STATUS.UNAUTHORIZED, true, undefined, details);
    this.name = this.constructor.name;
  }
}

/**
 * Exception thrown when an internal server error occurs.
 */
export class InternalServerException extends BaseException {
  /**
   * Creates a new InternalServerException instance.
   *
   * @param message - The error message
   * @param details - Additional error details
   */
  constructor(message: string = "Internal server error", details?: any) {
    super(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      false,
      undefined,
      details,
    );
    this.name = this.constructor.name;
  }
}
