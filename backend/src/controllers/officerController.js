import { getSupabaseClient } from '../config/supabaseClient.js';
import { AppError, ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';

const mapOfficer = (officer) => ({
  id: officer.id,
  name: officer.name,
  email: officer.email,
  phone: officer.phone,
  role: officer.role,
  badge_number: officer.badge_number,
  department: officer.department,
  rank: officer.rank,
  status: officer.status,
  is_online: officer.is_online,
  is_verified: officer.is_verified,
  phone_verified: officer.phone_verified,
  last_login_at: officer.last_login_at,
  last_logout_at: officer.last_logout_at,
  created_at: officer.created_at,
  updated_at: officer.updated_at,
});

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

/**
 * Get all officers for admin
 * GET /api/admin/officers
 */
export const getAllOfficersAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();

    const { data: officers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'police_officer')
      .order('name', { ascending: true });

    if (error) {
      throw new AppError(`Failed to fetch officers: ${error.message}`, 500);
    }

    return res.status(200).json({
      success: true,
      officers: (officers || []).map(mapOfficer),
      total: officers?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get officer by ID for admin
 * GET /api/admin/officers/:officerId
 */
export const getOfficerByIdAdmin = async (req, res, next) => {
  try {
    const { officerId } = req.params;

    const supabase = getSupabaseClient();
    const { data: officer, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', officerId)
      .eq('role', 'police_officer')
      .single();

    if (error || !officer) {
      throw new NotFoundError('Officer not found');
    }

    return res.status(200).json({
      success: true,
      officer: mapOfficer(officer),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create officer for admin
 * POST /api/admin/officers
 */
export const createOfficerAdmin = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const phone = String(req.body?.phone || '').trim();

    if (!name) {
      throw new ValidationError('name is required');
    }

    if (!phone) {
      throw new ValidationError('phone is required');
    }

    const supabase = getSupabaseClient();

    const payload = {
      name,
      phone,
      email: req.body?.email || null,
      role: 'police_officer',
      badge_number: req.body?.badge_number || null,
      department: req.body?.department || null,
      rank: req.body?.rank || null,
      status: req.body?.status || 'active',
      is_verified: Boolean(req.body?.is_verified),
      phone_verified: Boolean(req.body?.phone_verified),
    };

    const { data: officer, error } = await supabase
      .from('users')
      .insert([payload])
      .select('*')
      .single();

    if (error || !officer) {
      const message = error?.message || 'Unknown error';
      if (message.toLowerCase().includes('duplicate')) {
        throw new ConflictError('Officer with provided unique fields already exists');
      }
      throw new AppError(`Failed to create officer: ${message}`, 500);
    }

    return res.status(201).json({
      success: true,
      officer: mapOfficer(officer),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update officer for admin
 * PUT /api/admin/officers/:officerId
 */
export const updateOfficerAdmin = async (req, res, next) => {
  try {
    const { officerId } = req.params;
    const updates = {};

    if (req.body?.name !== undefined) {
      const name = String(req.body.name || '').trim();
      if (!name) throw new ValidationError('name cannot be empty');
      updates.name = name;
    }

    if (req.body?.phone !== undefined) {
      const phone = String(req.body.phone || '').trim();
      if (!phone) throw new ValidationError('phone cannot be empty');
      updates.phone = phone;
    }

    if (req.body?.email !== undefined) updates.email = req.body.email || null;
    if (req.body?.badge_number !== undefined) updates.badge_number = req.body.badge_number || null;
    if (req.body?.department !== undefined) updates.department = req.body.department || null;
    if (req.body?.rank !== undefined) updates.rank = req.body.rank || null;
    if (req.body?.status !== undefined) updates.status = req.body.status;
    if (req.body?.is_verified !== undefined) updates.is_verified = Boolean(req.body.is_verified);
    if (req.body?.phone_verified !== undefined) updates.phone_verified = Boolean(req.body.phone_verified);

    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No fields provided to update');
    }

    const supabase = getSupabaseClient();

    const { data: officer, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', officerId)
      .eq('role', 'police_officer')
      .select('*')
      .single();

    if (error || !officer) {
      const message = error?.message || 'Unknown error';
      if (message.toLowerCase().includes('duplicate')) {
        throw new ConflictError('Officer update violates unique constraints');
      }
      if (message.toLowerCase().includes('no rows')) {
        throw new NotFoundError('Officer not found');
      }
      throw new AppError(`Failed to update officer: ${message}`, 500);
    }

    return res.status(200).json({
      success: true,
      officer: mapOfficer(officer),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete officer for admin
 * DELETE /api/admin/officers/:officerId
 */
export const deleteOfficerAdmin = async (req, res, next) => {
  try {
    const { officerId } = req.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', officerId)
      .eq('role', 'police_officer')
      .select('id')
      .single();

    if (error || !data) {
      const message = error?.message || 'Unknown error';
      if (message.toLowerCase().includes('foreign key')) {
        throw new ConflictError('Cannot delete officer because related records exist');
      }
      if (message.toLowerCase().includes('no rows')) {
        throw new NotFoundError('Officer not found');
      }
      throw new AppError(`Failed to delete officer: ${message}`, 500);
    }

    return res.status(200).json({
      success: true,
      id: officerId,
      deleted: true,
    });
  } catch (error) {
    next(error);
  }
};
