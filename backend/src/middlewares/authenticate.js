import { verifyToken } from '../utils/jwtUtils.js';

export const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    // Extract token from "Bearer token" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>',
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    // Handle specific token errors
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please refresh your token.',
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or malformed token.',
      });
    }

    // Generic token verification error
    return res.status(401).json({
      success: false,
      message: error.message || 'Token verification failed',
    });
  }
};
