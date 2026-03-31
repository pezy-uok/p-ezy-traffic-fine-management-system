import { getSupabaseClient } from '../config/supabaseClient.js';
import { generateAccessToken, generateRefreshToken, decodeToken } from '../utils/jwtUtils.js';
import jwt from 'jsonwebtoken';

// In-memory OTP storage (In production, use Redis or database)
const otpStorage = new Map();

// In-memory refresh token storage (In production, use Redis or database)
const refreshTokenStorage = new Map();

// In-memory OTP request rate limiting (tracks last request time per email)
const otpRequestLimiter = new Map(); // { email: timestamp }

const OTP_COOLDOWN_SECONDS = 60; // 60 second cooldown between OTP requests

/**
 * Generate random OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

/**
 * Step 1: Request OTP - Police Officer or Admin enters email
 * POST /api/auth/request-otp
 * Body: { email }
 * Returns: { success, message, temporary_id }
 */
export const requestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const supabase = getSupabaseClient();

    // Query user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Check if user exists
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Email not found in system',
      });
    }

    // Check if user is admin or police officer
    if (user.role !== 'admin' && user.role !== 'police_officer') {
      return res.status(403).json({
        success: false,
        message: 'Only police officers and admins can access this system',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact admin.',
      });
    }

    // Check OTP rate limiting - prevent spam
    const lastRequestTime = otpRequestLimiter.get(email);
    const now = Date.now();
    
    if (lastRequestTime) {
      const secondsElapsed = Math.floor((now - lastRequestTime) / 1000);
      const remainingSeconds = OTP_COOLDOWN_SECONDS - secondsElapsed;
      
      if (remainingSeconds > 0) {
        return res.status(429).json({
          success: false,
          message: `Too many OTP requests. Please wait ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} before requesting another OTP.`,
          retryAfter: remainingSeconds,
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const temporaryId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store OTP temporarily (expires in 5 minutes)
    otpStorage.set(temporaryId, {
      email,
      otp,
      userId: user.id,
      phone: user.phone,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });

    // Track OTP request time for rate limiting
    otpRequestLimiter.set(email, Date.now());

    // TODO: Send OTP to phone number via SMS (integrate with SMS service)
    console.log(`📱 OTP sent to ${user.phone}: ${otp}`);
    // In production, integrate with AWS SES, Twilio, or similar SMS service
    // await sendSMS(user.phone, `Your PEZY login OTP is: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${user.phone}`,
      temporary_id: temporaryId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 2: Verify OTP - Officer submits 6-digit OTP
 * POST /api/auth/verify-otp
 * Body: { temporary_id, otp }
 * Returns: { token, user }
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { temporary_id, otp } = req.body;

    // Validate input
    if (!temporary_id || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Temporary ID and OTP are required',
      });
    }

    // Check if OTP exists in storage
    const otpData = otpStorage.get(temporary_id);

    if (!otpData) {
      return res.status(401).json({
        success: false,
        message: 'OTP session expired or invalid. Request a new OTP.',
      });
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      otpStorage.delete(temporary_id);
      return res.status(401).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    // Check attempt limit (max 3 attempts)
    if (otpData.attempts >= 3) {
      otpStorage.delete(temporary_id);
      return res.status(403).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      return res.status(401).json({
        success: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
      });
    }

    // OTP verified successfully - get user data
    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', otpData.userId)
      .single();

    // Mark user as online - update last_login_at and is_online
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_online: true,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', otpData.userId);

    if (updateError) {
      console.error('Error updating user login status:', updateError);
    }

    // Clean up OTP from storage
    otpStorage.delete(temporary_id);

    // Generate JWT tokens (access and refresh)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      badge: user.badge_number,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in memory (with expiry tracking)
    refreshTokenStorage.set(refreshToken, {
      userId: user.id,
      email: user.email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return success response with both tokens
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        phone: user.phone,
        badge: user.badge_number,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token - Generate new access token using refresh token
 * POST /api/auth/refresh-token
 * Body: { refreshToken }
 * Returns: { success, accessToken, newRefreshToken }
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Validate input
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Check if refresh token exists in storage
    const tokenData = refreshTokenStorage.get(refreshToken);

    if (!tokenData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please login again.',
      });
    }

    // Check if refresh token has expired
    if (Date.now() > tokenData.expiresAt) {
      refreshTokenStorage.delete(refreshToken);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.',
      });
    }

    // Verify refresh token signature
    try {
      jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-super-secret-key-change-in-production', {
        algorithms: ['HS256'],
      });
    } catch (error) {
      refreshTokenStorage.delete(refreshToken);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. Please login again.',
      });
    }

    // Decode refresh token to get user data
    const decoded = decodeToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      department: decoded.department,
      badge: decoded.badge,
    });

    // Optionally generate new refresh token (rotate refresh token)
    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      department: decoded.department,
      badge: decoded.badge,
    });

    // Update refresh token storage (delete old, add new)
    refreshTokenStorage.delete(refreshToken);
    refreshTokenStorage.set(newRefreshToken, {
      userId: decoded.id,
      email: decoded.email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout - Clear token on frontend and mark offline
 * POST /api/auth/logout
 * Headers: { Authorization: Bearer <token> }
 */
export const logout = async (req, res) => {
  try {
    // Extract user ID from JWT (middleware should add this)
    const userId = req.user?.id;

    if (userId) {
      const supabase = getSupabaseClient();
      
      // Mark user as offline
      await supabase
        .from('users')
        .update({
          is_online: false,
          last_logout_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful. Please discard your token.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

/**
 * Get Current User - Fetch authenticated user's profile
 * GET /api/auth/me
 * Headers: { Authorization: Bearer <token> }
 * Returns: { success, user }
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // User info is already attached to request by authenticate middleware
    const user = req.user;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Fetch fresh user data from database to get latest status (is_online, last_login_at)
    const supabase = getSupabaseClient();
    const { data: freshUserData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !freshUserData) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return user profile with fresh data
    return res.status(200).json({
      success: true,
      user: {
        id: freshUserData.id,
        email: freshUserData.email,
        name: freshUserData.name,
        role: freshUserData.role,
        phone: freshUserData.phone,
        department: freshUserData.department,
        badge_number: freshUserData.badge_number,
        is_active: freshUserData.is_active,
        is_online: freshUserData.is_online,
        last_login_at: freshUserData.last_login_at,
        last_logout_at: freshUserData.last_logout_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
