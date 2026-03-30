import express from 'express';
import { requestOTP, verifyOTP, logout } from '../controllers/authController.js';

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
 * Step 2: Officer enters OTP → System returns JWT token
 * Body: { temporary_id, otp }
 * Returns: { token, user }
 */
router.post('/verify-otp', verifyOTP);

/**
 * POST /api/auth/logout
 * Logout (frontend discards token)
 */
router.post('/logout', logout);

export default router;
