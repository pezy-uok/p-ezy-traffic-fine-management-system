import { getSupabaseClient } from '../config/supabaseClient.js';
import { AppError, NotFoundError, ValidationError } from '../utils/errors.js';

const toIsoDateString = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split('T')[0];
};

/**
 * Create a new warning
 * @param {object} warningData - Warning details
 * @param {object} authUser - Authenticated officer
 * @returns {Promise<object>} Created warning
 */
export const createWarning = async (warningData, authUser) => {
  if (!warningData || typeof warningData !== 'object') {
    throw new ValidationError('Warning payload is required');
  }

  console.log('\n🔧 CREATE WARNING - START');
  console.log(`   Auth User: ${authUser?.id ? '✅' : '❌'}`);

  const licenseNo = warningData.licenseNo || warningData.license_number;
  
  if (!licenseNo) {
    throw new ValidationError('licenseNo is required');
  }

  if (!warningData.reason) {
    throw new ValidationError('reason is required');
  }

  if (!authUser?.id) {
    throw new ValidationError('Authenticated user ID is required');
  }

  const supabase = getSupabaseClient();

  // Step 1: Get driver by license number
  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('id, license_number, vehicle_registration')
    .eq('license_number', licenseNo)
    .single();

  if (driverError || !driver) {
    console.error(`❌ Driver not found:`, driverError);
    throw new NotFoundError('Driver not found for the provided licenseNo');
  }

  const issueDate = toIsoDateString(warningData.issueDate || warningData.issue_date) || toIsoDateString(new Date());
  
  // Build payload with required fields
  const insertPayload = {
    driver_id: driver.id,
    issued_by_officer_id: authUser.id,
    reason: warningData.reason,
    severity: warningData.severity || 'minor',
    issue_date: issueDate,
  };

  // Add optional fields
  if (warningData.violationCode || warningData.violation_code) {
    insertPayload.violation_code = warningData.violationCode || warningData.violation_code;
  }

  if (warningData.location) {
    insertPayload.location = warningData.location;
  }

  const vehicleReg = warningData.vehicleRegistration || warningData.vehicle_registration || driver.vehicle_registration;
  if (vehicleReg) {
    insertPayload.vehicle_registration = vehicleReg;
  }

  console.log(`\n🔧 WARNING INSERT DEBUG`);
  console.log(`   Payload:`, JSON.stringify(insertPayload, null, 2));

  try {
    const { data: createdWarning, error: createError } = await supabase
      .from('warnings')
      .insert([insertPayload])
      .select('*')
      .single();

    if (createError) {
      console.error(`❌ Insert Error:`, createError);
      throw new AppError(`Failed to create warning: ${createError.message}`, 500);
    }

    if (!createdWarning) {
      throw new AppError('Failed to create warning: No data returned', 500);
    }

    console.log(`✅ Warning created:`, createdWarning.id);

    return {
      id: createdWarning.id,
      driver_id: createdWarning.driver_id,
      license_number: driver.license_number,
      issued_by_officer_id: createdWarning.issued_by_officer_id,
      reason: createdWarning.reason,
      severity: createdWarning.severity,
      violation_code: createdWarning.violation_code,
      location: createdWarning.location,
      vehicle_registration: createdWarning.vehicle_registration,
      issue_date: createdWarning.issue_date,
      acknowledged: createdWarning.acknowledged,
      created_at: createdWarning.created_at,
      updated_at: createdWarning.updated_at,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error(`❌ Unexpected error:`, err.message);
    throw new AppError(`Failed to create warning: ${err.message}`, 500);
  }
};

/**
 * Get warning by ID (admin only)
 */
export const getWarningById = async (warningId) => {
  if (!warningId) {
    throw new ValidationError('warningId is required');
  }

  const supabase = getSupabaseClient();

  const { data: warning, error } = await supabase
    .from('warnings')
    .select(`
      id,
      driver_id,
      issued_by_officer_id,
      reason,
      severity,
      violation_code,
      location,
      vehicle_registration,
      issue_date,
      acknowledged,
      created_at,
      updated_at,
      drivers(id, license_number, first_name, last_name)
    `)
    .eq('id', warningId)
    .is('deleted_at', null)
    .single();

  if (error || !warning) {
    throw new NotFoundError('Warning not found');
  }

  const driver = warning.drivers || {};

  return {
    id: warning.id,
    driver_id: warning.driver_id,
    license_number: driver.license_number,
    driver_name: driver.first_name || driver.last_name ? `${driver.first_name} ${driver.last_name}`.trim() : null,
    issued_by_officer_id: warning.issued_by_officer_id,
    reason: warning.reason,
    severity: warning.severity,
    violation_code: warning.violation_code,
    location: warning.location,
    vehicle_registration: warning.vehicle_registration,
    issue_date: warning.issue_date,
    acknowledged: warning.acknowledged,
    created_at: warning.created_at,
    updated_at: warning.updated_at,
  };
};

/**
 * Get all warnings (admin only)
 */
export const getAllWarningsAdmin = async (filters = {}) => {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('warnings')
    .select(`
      id,
      driver_id,
      issued_by_officer_id,
      reason,
      severity,
      violation_code,
      location,
      vehicle_registration,
      issue_date,
      acknowledged,
      created_at,
      updated_at,
      drivers(id, license_number, first_name, last_name)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Apply filters if provided
  if (filters.severity) {
    query = query.eq('severity', filters.severity);
  }

  if (filters.acknowledged !== undefined) {
    query = query.eq('acknowledged', filters.acknowledged);
  }

  if (filters.driverId) {
    query = query.eq('driver_id', filters.driverId);
  }

  const { data: warnings, error } = await query;

  if (error) {
    throw new AppError(`Failed to fetch warnings: ${error.message}`, 500);
  }

  return (warnings || []).map((w) => {
    const driver = w.drivers || {};
    return {
      id: w.id,
      driver_id: w.driver_id,
      license_number: driver.license_number,
      driver_name: driver.first_name || driver.last_name ? `${driver.first_name} ${driver.last_name}`.trim() : null,
      issued_by_officer_id: w.issued_by_officer_id,
      reason: w.reason,
      severity: w.severity,
      violation_code: w.violation_code,
      location: w.location,
      vehicle_registration: w.vehicle_registration,
      issue_date: w.issue_date,
      acknowledged: w.acknowledged,
      created_at: w.created_at,
      updated_at: w.updated_at,
    };
  });
};

/**
 * Get warnings by driver license (officer)
 */
export const getWarningsByLicense = async (licenseNo) => {
  if (!licenseNo) {
    throw new ValidationError('licenseNo is required');
  }

  const supabase = getSupabaseClient();

  // Step 1: Get driver
  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('id, license_number')
    .eq('license_number', licenseNo)
    .single();

  if (driverError || !driver) {
    throw new NotFoundError('Driver not found');
  }

  // Step 2: Get warnings for this driver
  const { data: warnings, error: warningsError } = await supabase
    .from('warnings')
    .select('*')
    .eq('driver_id', driver.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (warningsError) {
    throw new AppError(`Failed to fetch warnings: ${warningsError.message}`, 500);
  }

  return {
    driver_info: {
      id: driver.id,
      license_number: driver.license_number,
    },
    warnings: (warnings || []).map((w) => ({
      id: w.id,
      reason: w.reason,
      severity: w.severity,
      violation_code: w.violation_code,
      location: w.location,
      issue_date: w.issue_date,
      acknowledged: w.acknowledged,
      created_at: w.created_at,
    })),
  };
};

/**
 * Update warning (admin only)
 */
export const updateWarningAdmin = async (warningId, updateData) => {
  if (!warningId) {
    throw new ValidationError('warningId is required');
  }

  const supabase = getSupabaseClient();

  // Build update payload - only allow certain fields
  const updatePayload = {};

  if (updateData.reason) updatePayload.reason = updateData.reason;
  if (updateData.severity) updatePayload.severity = updateData.severity;
  if (updateData.violation_code) updatePayload.violation_code = updateData.violation_code;
  if (updateData.location) updatePayload.location = updateData.location;
  if (updateData.vehicle_registration) updatePayload.vehicle_registration = updateData.vehicle_registration;
  if (updateData.acknowledged !== undefined) updatePayload.acknowledged = updateData.acknowledged;

  if (Object.keys(updatePayload).length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  const { data: updatedWarning, error } = await supabase
    .from('warnings')
    .update(updatePayload)
    .eq('id', warningId)
    .select('*')
    .single();

  if (error || !updatedWarning) {
    throw new AppError(`Failed to update warning: ${error?.message || 'Unknown error'}`, 500);
  }

  return {
    id: updatedWarning.id,
    reason: updatedWarning.reason,
    severity: updatedWarning.severity,
    violation_code: updatedWarning.violation_code,
    location: updatedWarning.location,
    vehicle_registration: updatedWarning.vehicle_registration,
    issue_date: updatedWarning.issue_date,
    acknowledged: updatedWarning.acknowledged,
    updated_at: updatedWarning.updated_at,
  };
};

/**
 * Delete warning - soft delete (admin only)
 */
export const deleteWarningAdmin = async (warningId) => {
  if (!warningId) {
    throw new ValidationError('warningId is required');
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('warnings')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', warningId);

  if (error) {
    throw new AppError(`Failed to delete warning: ${error.message}`, 500);
  }

  return { success: true, id: warningId, message: 'Warning deleted successfully' };
};

/**
 * Acknowledge warning (driver or officer)
 */
export const acknowledgeWarning = async (warningId) => {
  if (!warningId) {
    throw new ValidationError('warningId is required');
  }

  const supabase = getSupabaseClient();

  const { data: updatedWarning, error } = await supabase
    .from('warnings')
    .update({ acknowledged: true })
    .eq('id', warningId)
    .select('*')
    .single();

  if (error || !updatedWarning) {
    throw new AppError(`Failed to acknowledge warning: ${error?.message || 'Unknown error'}`, 500);
  }

  return {
    id: updatedWarning.id,
    acknowledged: updatedWarning.acknowledged,
    acknowledged_at: updatedWarning.updated_at,
  };
};
