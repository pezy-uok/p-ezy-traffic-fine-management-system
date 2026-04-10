import { getSupabaseClient } from '../config/supabaseClient.js';
import { generateAccessToken, generateRefreshToken, decodeToken } from '../utils/jwtUtils.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// In-memory OTP storage (In production, use Redis or database)
const otpStorage = new Map();

// In-memory refresh token storage (In production, use Redis or database)
const refreshTokenStorage = new Map();

// In-memory OTP request rate limiting (tracks last request time per email)
const otpRequestLimiter = new Map(); // { email: timestamp }

const OTP_COOLDOWN_SECONDS = 60; // 60 second cooldown between OTP requests

const findAdminByIdentifier = async (identifier) => {
  const supabase = getSupabaseClient();
  const normalizedIdentifier = String(identifier).trim().toLowerCase();

  // 1) Exact email match
  let lookup = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedIdentifier)
    .maybeSingle();

  if (lookup.data && !lookup.error) {
    return lookup.data;
  }

  // 2) Username-like match by email local-part (e.g. "admin" -> admin@...)
  if (!normalizedIdentifier.includes('@')) {
    lookup = await supabase
      .from('users')
      .select('*')
      .ilike('email', `${normalizedIdentifier}@%`)
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle();

    if (lookup.data && !lookup.error) {
      return lookup.data;
    }
  }

  return null;
};

/**
 * Admin OTP Request - Identifier (username or email) only
 * POST /api/auth/admin-request-otp
 * Body: { identifier }
 */
export const requestAdminOTP = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is required',
      });
    }

    const user = await findAdminByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive',
      });
    }

    const lastRequestTime = otpRequestLimiter.get(user.email);
    const now = Date.now();

    if (lastRequestTime) {
      const secondsElapsed = Math.floor((now - lastRequestTime) / 1000);
      const remainingSeconds = OTP_COOLDOWN_SECONDS - secondsElapsed;

      if (remainingSeconds > 0) {
        return res.status(429).json({
          success: false,
          message: `Too many OTP requests. Please wait ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}.`,
          retryAfter: remainingSeconds,
        });
      }
    }

    const otp = generateOTP();
    const temporaryId = `admin_otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    otpStorage.set(temporaryId, {
      email: user.email,
      otp,
      role: 'admin',
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    otpRequestLimiter.set(user.email, Date.now());

    // Testing mode: OTP is printed to terminal instead of sending via email service.
    console.log('\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║      ADMIN EMAIL OTP (TEST MODE)      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Email: ${(user.email || '').padEnd(31)} ║`);
    console.log(`║  OTP Code: ${otp.padEnd(25)} ║`);
    console.log('║  Expires in: 5 minutes                ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n');

    return res.status(200).json({
      success: true,
      message: `OTP generated for ${user.email}. Check backend terminal (test mode).`,
      temporary_id: temporaryId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Login - Email/identifier + password to JWT
 * POST /api/auth/admin-login
 * Body: { identifier, password }
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and password are required',
      });
    }

    const normalizedIdentifier = String(identifier).trim().toLowerCase();
    const normalizedPassword = String(password);
    const supabase = getSupabaseClient();

    // Try email first; fallback to badge_number when identifier is not an email.
    let userQuery = supabase
      .from('users')
      .select('*')
      .eq('email', normalizedIdentifier)
      .maybeSingle();

    let { data: user, error } = await userQuery;

    if ((!user || error) && !normalizedIdentifier.includes('@')) {
      const badgeLookup = await supabase
        .from('users')
        .select('*')
        .eq('badge_number', normalizedIdentifier)
        .maybeSingle();

      user = badgeLookup.data;
      error = badgeLookup.error;
    }

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive',
      });
    }

    // Prefer secure hash verification; fallback supports dev data that may still store plain password.
    let isPasswordValid = false;
    if (user.pin_hash) {
      try {
        isPasswordValid = await bcrypt.compare(normalizedPassword, user.pin_hash);
      } catch {
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid && user.password) {
      isPasswordValid = normalizedPassword === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
      })
      .eq('id', user.id);

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

    refreshTokenStorage.set(refreshToken, {
      userId: user.id,
      email: user.email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        badge: user.badge_number,
      },
    });
  } catch (error) {
    next(error);
  }
};

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
    console.log(`\n📞 OTP Request received for: ${email}`);

    // Validate input
    if (!email) {
      console.log('❌ Email is required');
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Validate email domain - must be @pezy.gov
    if (!email.endsWith('@pezy.gov')) {
      console.log('❌ Invalid email domain:', email);
      return res.status(403).json({
        success: false,
        message: 'Only @pezy.gov email addresses are allowed',
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
      console.log('❌ User not found:', email, error?.message);
      return res.status(401).json({
        success: false,
        message: 'Email not found in system',
      });
    }

    console.log(`✓ User found: ${user.name} (${user.email}), Role: ${user.role}, Status: ${user.status}`);

    // Check if user is admin or police officer
    if (user.role !== 'admin' && user.role !== 'police_officer') {
      console.log(`❌ User role invalid: ${user.role}`);
      return res.status(403).json({
        success: false,
        message: 'Only police officers and admins can access this system',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      console.log(`❌ User status invalid: ${user.status}`);
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
        console.log(`⏱️ Rate limited: ${remainingSeconds}s remaining`);
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
    console.log('\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║          🔐 OTP GENERATED             ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Phone: ${user.phone.padEnd(31)} ║`);
    console.log(`║  OTP Code: ${otp.padEnd(25)} ║`);
    console.log(`║  Expires in: 5 minutes${' '.repeat(13)} ║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('\n');
    // In production, integrate with AWS SES, Twilio, or similar SMS service
    // await sendSMS(user.phone, `Your PEZY login OTP is: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${user.phone}`,
      temporary_id: temporaryId,
    });
  } catch (error) {
    console.log('🔴 Error in requestOTP:', error.message);
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
    const { temporary_id, otp, expectedRole } = req.body;

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

    if (expectedRole && otpData.role && otpData.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: 'OTP session role mismatch',
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

    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: `${expectedRole} access required`,
      });
    }

    // Mark user as online - update last_login
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
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
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  LOGOUT ENDPOINT                       ║');
    console.log('╠════════════════════════════════════════╣');

    // Extract user ID from JWT (middleware should add this)
    const userId = req.user?.id;
    console.log(`║ User ID from req.user: ${userId ? `✅ ${userId}` : '❌ null'}`);
    console.log(`║ Full req.user: ${JSON.stringify(req.user)}`);

    if (userId) {
      console.log('║ Attempting to update last_activity_at...');
      const supabase = getSupabaseClient();
      const nowIso = new Date().toISOString();
      
      // Mark user as offline and store logout timestamps
      const { data, error } = await supabase
        .from('users')
        .update({
          last_activity_at: nowIso,
          is_online: false,
          last_logout: nowIso,
          last_logout_at: nowIso,
        })
        .eq('id', userId);

      if (error) {
        console.log(`║ ❌ Database error: ${error.message}`);
        console.log(`╚════════════════════════════════════════╝\n`);
        return res.status(500).json({
          success: false,
          message: 'Failed to update user status',
          error: error.message,
        });
      }

      console.log(`║ ✅ User ${userId} last_activity_at updated`);
    } else {
      console.log('║ ⚠️  No user ID found - token validation may have failed');
    }

    console.log('║ Sending 200 response - Logout successful');
    console.log('╚════════════════════════════════════════╝\n');
    
    return res.status(200).json({
      success: true,
      message: 'Logout successful. Please discard your token.',
    });
  } catch (error) {
    console.log('║ ❌ ERROR in logout:');
    console.log(`║    ${error.message}`);
    console.log(`║    Stack: ${error.stack}`);
    console.log('╚════════════════════════════════════════╝\n');
    
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
        status: freshUserData.status,
        last_login: freshUserData.last_login,
        last_activity_at: freshUserData.last_activity_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email - Check if email is registered and eligible for login
 * POST /api/auth/verify
 * Body: { email }
 * Returns: { success, exists: true/false, message, user: {...} }
 */
export const verifyEmail = async (req, res, next) => {
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

    // User doesn't exist
    if (error || !user) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'Email not registered in the system',
      });
    }

    // Check if user has eligible role (police_officer or admin)
    if (user.role !== 'admin' && user.role !== 'police_officer') {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'This email is not eligible for police officer login',
      });
    }

    // Check if user is active
    if (user.is_active === false) {
      return res.status(200).json({
        success: true,
        exists: true,
        active: false,
        message: 'Account is inactive. Please contact administrator.',
      });
    }

    // User exists, is active, and has correct role
    return res.status(200).json({
      success: true,
      exists: true,
      active: true,
      message: 'Email found. Proceed to OTP verification.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};
