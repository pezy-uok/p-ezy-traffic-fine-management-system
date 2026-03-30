import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';

/**
 * Generate JWT Access Token on login
 * Called when admin or police officer successfully logs in
 * @param {Object} payload - User data (e.g., { id, email, role, badge })
 * @returns {string} - Signed JWT token
 * @throws {Error} - If token generation fails
 */
export const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
};

/**
 * Decode token for inspection (no verification)
 * @param {string} token - Token to decode
 * @returns {Object} - Decoded payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
