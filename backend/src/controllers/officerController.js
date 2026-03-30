import { getSupabaseClient } from '../config/supabaseClient.js';

/**
 * Get all currently online police officers
 * GET /api/officers/online
 * Admin only endpoint
 * Returns list of officers currently logged in
 */
export const getOnlineOfficers = async (req, res, next) => {
  try {
    // Check if user is admin (middleware should validate)
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view online officers',
      });
    }

    const supabase = getSupabaseClient();

    // Query all online police officers
    const { data: onlineOfficers, error } = await supabase
      .from('users')
      .select('id, email, name, role, department, badge_number, is_online, last_login_at')
      .eq('role', 'police_officer')
      .eq('is_online', true)
      .order('last_login_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch online officers',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: onlineOfficers?.length || 0,
      officers: onlineOfficers || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all police officers (online and offline)
 * GET /api/officers
 * Admin only endpoint
 * Returns all officers with their status
 */
export const getAllOfficers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view officers',
      });
    }

    const supabase = getSupabaseClient();

    // Query all police officers
    const { data: officers, error } = await supabase
      .from('users')
      .select('id, email, name, role, department, badge_number, phone, is_online, last_login_at, last_logout_at, status')
      .eq('role', 'police_officer')
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch officers',
        error: error.message,
      });
    }

    // Count online vs offline
    const onlineCount = officers?.filter(o => o.is_online).length || 0;
    const offlineCount = (officers?.length || 0) - onlineCount;

    return res.status(200).json({
      success: true,
      summary: {
        total: officers?.length || 0,
        online: onlineCount,
        offline: offlineCount,
      },
      officers: officers || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get officer status (single officer)
 * GET /api/officers/:id
 * Admin endpoint
 */
export const getOfficerStatus = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view officer details',
      });
    }

    const { id } = req.params;

    const supabase = getSupabaseClient();

    const { data: officer, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'police_officer')
      .single();

    if (error || !officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found',
      });
    }

    return res.status(200).json({
      success: true,
      officer: {
        id: officer.id,
        name: officer.name,
        email: officer.email,
        badge: officer.badge_number,
        department: officer.department,
        phone: officer.phone,
        is_online: officer.is_online,
        status: officer.status,
        last_login_at: officer.last_login_at,
        last_logout_at: officer.last_logout_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
