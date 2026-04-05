/**
 * Global Error Handler Middleware
 *
 * This middleware catches all errors thrown in the application
 * and returns a standardized error response with consistent formatting
 * for auth failures, validation errors, and server errors
 */

import { 
  AppError, 
  TokenExpiredError, 
  InvalidTokenError, 
  UnauthorizedError, 
  ForbiddenError,
  RateLimitError 
} from '../utils/errors.js';

/**
 * Error handler middleware
 * Must be defined last, after all other app.use() and routes
 * Handles: token expired, invalid token, unauthorized, forbidden, rate limit
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error details for debugging
  console.error({
    status: err.statusCode,
    name: err.name,
    message: err.message,
    errorType: err.errorType,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  // ===== AUTH FAILURE ERRORS =====

  // Token Expired Error - 401
  if (err instanceof TokenExpiredError || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Token has expired. Please refresh your token or login again.',
      errorType: 'TOKEN_EXPIRED',
      error: 'Unauthorized',
    });
  }

  // Invalid Token Error - 401
  if (err instanceof InvalidTokenError || err.name === 'InvalidTokenError') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid or malformed authentication token.',
      errorType: 'INVALID_TOKEN',
      error: 'Unauthorized',
    });
  }

  // Generic Unauthorized Error - 401
  if (err instanceof UnauthorizedError || err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authentication failed. Please provide valid credentials.',
      errorType: 'UNAUTHORIZED',
      error: 'Unauthorized',
    });
  }

  // Forbidden Error (Insufficient Permissions) - 403
  if (err instanceof ForbiddenError || err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Access denied. You do not have permission to access this resource.',
      errorType: 'FORBIDDEN',
      error: 'Forbidden',
    });
  }

  // Rate Limit Error - 429
  if (err instanceof RateLimitError || err.name === 'RateLimitError') {
    const response = {
      success: false,
      statusCode: 429,
      message: err.message || 'Too many requests. Please try again later.',
      errorType: 'RATE_LIMIT',
      error: 'Too Many Requests',
    };

    // Add retryAfter if available
    if (err.retryAfter) {
      response.retryAfter = err.retryAfter;
    }

    // Set retry-after header if available
    if (err.retryAfter) {
      res.set('Retry-After', err.retryAfter);
    }

    return res.status(429).json(response);
  }

  // ===== OTHER ERROR TYPES =====

  // Validation Error - 400
  if (err.statusCode === 400 || err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message || 'Validation failed',
      error: 'Bad Request',
    });
  }

  // Not Found Error - 404
  if (err.statusCode === 404 || err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: err.message || 'Resource not found',
      error: 'Not Found',
    });
  }

  // Conflict Error - 409
  if (err.statusCode === 409 || err.name === 'ConflictError') {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: err.message || 'Resource conflict',
      error: 'Conflict',
    });
  }

  // Database/Supabase errors
  if (err.message?.includes('duplicate') || err.message?.includes('constraint')) {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: 'Duplicate entry or constraint violation',
      error: 'Conflict',
    });
  }

  // Generic error response - 500 or custom status
  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    error: err.statusCode >= 500 ? 'Server Error' : 'Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler middleware
 * Catches all undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export { errorHandler, notFoundHandler };
