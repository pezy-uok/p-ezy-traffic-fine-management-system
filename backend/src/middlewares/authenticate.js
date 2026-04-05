import { verifyToken } from '../utils/jwtUtils.js';

export const authenticate = (req, res, next) => {
  try {
    console.log('\n🔐 AUTHENTICATE MIDDLEWARE');
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    console.log(`   Authorization header present: ${authHeader ? '✅' : '❌'}`);

    if (!authHeader) {
      console.log('   ❌ No authorization token provided\n');
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    // Extract token from "Bearer token" format
    const parts = authHeader.split(' ');
    console.log(`   Header format: ${parts[0]} (expected: Bearer)`);
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('   ❌ Invalid authorization header format\n');
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>',
      });
    }

    const token = parts[1];
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Verify token
    const decoded = verifyToken(token);
    console.log(`   ✅ Token verified. User ID: ${decoded.id}`);
    console.log(`   Decoded payload: ${JSON.stringify(decoded)}\n`);

    // Attach user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    console.log(`\n   ❌ Auth middleware error: ${error.message}\n`);
    
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
