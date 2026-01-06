/**
 * Creates a standard success response.
 *
 * @param message - The success message
 * @param data - Optional data to include in the response
 * @param statusCode - The HTTP status code (default: 200)
 * @param meta - Optional metadata to include in the response
 * @returns The success response object
 */
export const successResponse = (
  message: string,
  data?: any,
  statusCode: number = 200,
  meta?: any,
) => {
  const response: any = {
    success: true,
    message,
    statusCode,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Creates a standard error response.
 *
 * @param message - The error message
 * @param statusCode - The HTTP status code (default: 500)
 * @param errors - Optional array of specific errors
 * @param stack - Optional stack trace for development
 * @returns The error response object
 */
export const errorResponse = (
  message: string,
  statusCode: number = 500,
  errors?: any[],
  stack?: any,
) => {
  const response: any = {
    success: false,
    message,
    statusCode,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === "development" && stack) {
    response.stack = stack;
  }

  return response;
};

/**
 * Creates a paginated response.
 *
 * @param data - The paginated data
 * @param page - The current page number
 * @param limit - The number of items per page
 * @param total - The total number of items
 * @param message - The success message (default: "Success")
 * @returns The paginated response object
 */
export const paginatedResponse = (
  data: any[],
  page: number,
  limit: number,
  total: number,
  message: string = "Success",
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return successResponse(message, data, 200, {
    pagination: {
      currentPage: page,
      totalPages,
      pageSize: limit,
      totalItems: total,
      hasNextPage,
      hasPrevPage,
    },
  });
};
