class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Static methods for common error types
  static badRequest(message: string = 'Bad Request'): ApiError {
    return new ApiError(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string = 'Not Found'): ApiError {
    return new ApiError(message, 404);
  }

  static conflict(message: string = 'Conflict'): ApiError {
    return new ApiError(message, 409);
  }

  static unprocessableEntity(message: string = 'Unprocessable Entity'): ApiError {
    return new ApiError(message, 422);
  }

  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(message, 500);
  }
}

export default ApiError;