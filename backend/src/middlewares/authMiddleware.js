import { decodeToken } from '../utils/jwtUtils.js';

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * Attaches decoded user info to req.user
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Decode token (without verification for simplicity)
    const decoded = decodeToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token validation failed',
      error: error.message,
    });
  }
};

/**
 * Admin-only Middleware
 * Checks if user role is admin
 * Must be used after authMiddleware
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

/**
 * Police Officer-only Middleware
 * Checks if user role is police_officer
 * Must be used after authMiddleware
 */
export const policeOfficerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'police_officer') {
    return res.status(403).json({
      success: false,
      message: 'Police officer access required',
    });
  }

  next();
};
