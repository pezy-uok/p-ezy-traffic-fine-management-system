/**
 * Global Error Handler Middleware
 *
 * This middleware catches all errors thrown in the application
 * and returns a standardized error response
 */

import { AppError } from '../utils/errors.js';

/**
 * Error handler middleware
 * Must be defined last, after all other app.use() and routes
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error details
  console.error({
    status: err.statusCode,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  });

  // Handle specific error types

  // Supabase authentication errors
  if (err.message.includes('auth') || err.message.includes('Authentication')) {
    err.statusCode = 401;
    err.message = 'Authentication failed';
  }

  // Database/Supabase errors
  if (err.message.includes('duplicate') || err.message.includes('constraint')) {
    err.statusCode = 409;
    err.message = 'Duplicate entry or constraint violation';
  }

  // Validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message,
      error: 'Bad Request',
    });
  }

  // Not found errors
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: err.message,
      error: 'Not Found',
    });
  }

  // Unauthorized errors
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: err.message,
      error: 'Unauthorized',
    });
  }

  // Forbidden errors
  if (err.statusCode === 403) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: err.message,
      error: 'Forbidden',
    });
  }

  // Conflict errors
  if (err.statusCode === 409) {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: err.message,
      error: 'Conflict',
    });
  }

  // Generic error response
  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    error: 'Server Error',
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
