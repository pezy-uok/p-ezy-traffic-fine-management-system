import { getSupabaseClient } from '../config/supabaseClient.js';
import { generateAccessToken } from '../utils/jwtUtils.js';

// In-memory OTP storage (In production, use Redis or database)
const otpStorage = new Map();

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

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      badge: user.badge_number,
    };

    const token = generateAccessToken(tokenPayload);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
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
