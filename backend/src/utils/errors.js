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

/**
 * Token Expired Error - Specific auth error for expired JWT tokens
 */
class TokenExpiredError extends AppError {
  constructor(message = 'Token has expired. Please refresh or login again.') {
    super(message, 401);
    this.name = 'TokenExpiredError';
    this.errorType = 'TOKEN_EXPIRED';
  }
}

/**
 * Invalid Token Error - Specific auth error for malformed/invalid tokens
 */
class InvalidTokenError extends AppError {
  constructor(message = 'Invalid or malformed token.') {
    super(message, 401);
    this.name = 'InvalidTokenError';
    this.errorType = 'INVALID_TOKEN';
  }
}

/**
 * Unauthorized Error - Specific auth error for missing/invalid credentials
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized. Please provide valid credentials.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
    this.errorType = 'UNAUTHORIZED';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden. Insufficient permissions.') {
    super(message, 403);
    this.name = 'ForbiddenError';
    this.errorType = 'FORBIDDEN';
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

/**
 * Rate Limit Error - Too many requests
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.', retryAfter = null) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.errorType = 'RATE_LIMIT';
    this.retryAfter = retryAfter;
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
  TokenExpiredError,
  InvalidTokenError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
};
