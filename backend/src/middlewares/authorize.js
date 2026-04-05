export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (authenticate middleware should run first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated. Please provide a valid token.',
        });
      }

      // Check if user's role is in allowed roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message,
      });
    }
  };
};
