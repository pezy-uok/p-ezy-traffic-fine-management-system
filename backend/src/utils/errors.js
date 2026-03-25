/**
 * Custom AppError Utility Class
 *
 * Standardized error class for the application with built-in
 * status codes and structured error handling
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Predefined Error Factory Methods
 * Provides convenient constructors for common error scenarios
 */

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}

export {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ServiceUnavailableError,
};
