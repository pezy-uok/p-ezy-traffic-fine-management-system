import express from 'express';
import { requestOTP, verifyOTP, refreshAccessToken, logout, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

/**
 * POST /api/auth/request-otp
 * Step 1: Officer enters email → System sends OTP to phone
 * Body: { email }
 * Returns: { temporary_id, message }
 */
router.post('/request-otp', requestOTP);

/**
 * POST /api/auth/verify-otp
 * Step 2: Officer enters OTP → System returns JWT tokens (access + refresh)
 * Body: { temporary_id, otp }
 * Returns: { accessToken, refreshToken, user }
 */
router.post('/verify-otp', verifyOTP);

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Headers: { Authorization: Bearer <token> }
 * Returns: { success, user }
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken }
 */
router.post('/refresh-token', refreshAccessToken);

/**
 * POST /api/auth/refresh
 * Alias for /refresh-token (shorter endpoint)
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken }
 */
router.post('/refresh', refreshAccessToken);

/**
 * POST /api/auth/logout
 * Logout (frontend discards token)
 */
router.post('/logout', logout);

export default router;
