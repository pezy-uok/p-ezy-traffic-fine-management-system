import express from 'express';
import { requestOTP, verifyOTP, refreshAccessToken, logout, getCurrentUser, verifyEmail, adminLogin, requestAdminOTP } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

/**
 * POST /api/auth/verify
 * Check if email is registered and eligible for login
 * Body: { email }
 * Returns: { success, exists: true/false, message, user: {...} }
 */
router.post('/verify', verifyEmail);

/**
 * POST /api/auth/admin-login
 * Admin login with identifier + password
 * Body: { identifier, password }
 */
router.post('/admin-login', adminLogin);

/**
 * POST /api/auth/admin-request-otp
 * Admin login step 1 with Username/Email
 * Body: { identifier }
 */
router.post('/admin-request-otp', requestAdminOTP);

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
 * Headers: { Authorization: Bearer <token> }
 */
router.post('/logout', authenticate, logout);

export default router;
