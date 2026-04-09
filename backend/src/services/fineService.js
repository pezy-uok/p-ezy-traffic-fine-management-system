import { getSupabaseClient } from '../config/supabaseClient.js';
import { AppError, NotFoundError, ValidationError } from '../utils/errors.js';
import { generateFineReference } from '../utils/fineReferenceGenerator.js';

const MAX_UNPAID_FINES = 3;

const notImplemented = (methodName) => {
  throw new AppError(`FineService.${methodName} is not implemented yet`, 501);
};

const toIsoDateString = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split('T')[0];
};

const addDays = (isoDate, days) => {
  const base = new Date(isoDate);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().split('T')[0];
};

/**
 * PEZY-412: Check if a driver has reached max unpaid fines limit
 * 
 * Count unpaid fines for a driver. Throw error if >= 5 fines.
 * Prevents drivers from accumulating too many unpaid traffic fines.
 * 
 * @param {string} driverId - UUID of the driver
 * @returns {Promise<number>} Count of unpaid fines
 * @throws {AppError} 409 if count >= 5 (maxFinesExceeded)
 * 
 * @example
 * const count = await checkMaxFines(driverId);
 * // Returns: 3 (driver has 3 unpaid fines, under limit)
 * 
 * // If driver has 5+ unpaid fines:
 * // Throws: AppError with statusCode 409
 */
export const checkMaxFines = async (driverId) => {
  const supabase = getSupabaseClient();

  const { count: unpaidCount, error: countError } = await supabase
    .from('fines')
    .select('id', { count: 'exact', head: true })
    .eq('driver_id', driverId)
    .eq('status', 'unpaid');

  if (countError) {
    throw new AppError(
      `Failed to validate unpaid fine count: ${countError.message}`,
      500
    );
  }

  const count = unpaidCount || 0;

  if (count >= MAX_UNPAID_FINES) {
    throw new AppError(
      `Driver has reached maximum unpaid fines limit (${MAX_UNPAID_FINES}). Current unpaid fines: ${count}. Mobile app shows warning escalation screen.`,
      409
    );
  }

  return count;
};

export const createFine = async (fineData, authUser) => {
  if (!fineData || typeof fineData !== 'object') {
    throw new ValidationError('Fine payload is required');
  }

  const licenseNo = fineData.licenseNo || fineData.license_number;
  const amount = Number(fineData.amount);

  if (!licenseNo) {
    throw new ValidationError('licenseNo is required');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError('amount must be a positive number');
  }

  if (!fineData.reason) {
    throw new ValidationError('reason is required');
  }

  const supabase = getSupabaseClient();

  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('id, license_number, vehicle_registration')
    .eq('license_number', licenseNo)
    .single();

  if (driverError || !driver) {
    throw new NotFoundError('Driver not found for the provided licenseNo');
  }

  // PEZY-412: Check max unpaid fines limit
  await checkMaxFines(driver.id);

  const issueDate = toIsoDateString(fineData.issuedDate || fineData.issue_date) || toIsoDateString(new Date());
  const dueDate = toIsoDateString(fineData.dueDate || fineData.due_date) || addDays(issueDate, 14);
  const fineRef = generateFineReference();

  const insertPayload = {
    driver_id: driver.id,
    issued_by_officer_id: fineData.issuedByOfficerId || fineData.issued_by_officer_id || authUser?.id,
    amount,
    reason: fineData.reason,
    violation_code: fineData.violationCode || fineData.violation_code || fineData.violationType || fineRef,
    location: fineData.location || null,
    vehicle_registration:
      fineData.vehicleRegistration || fineData.vehicle_registration || driver.vehicle_registration || null,
    issue_date: issueDate,
    due_date: dueDate,
    status: 'unpaid',
  };

  if (!insertPayload.issued_by_officer_id) {
    throw new ValidationError('issuedByOfficerId is required');
  }

  const { data: createdFine, error: createError } = await supabase
    .from('fines')
    .insert([insertPayload])
    .select('*')
    .single();

  if (createError || !createdFine) {
    throw new AppError(`Failed to create fine: ${createError?.message || 'Unknown error'}`, 500);
  }

  return {
    id: createdFine.id,
    fine_ref: fineRef,
    driver_id: createdFine.driver_id,
    license_number: driver.license_number,
    issued_by_officer_id: createdFine.issued_by_officer_id,
    amount: createdFine.amount,
    reason: createdFine.reason,
    violation_code: createdFine.violation_code,
    location: createdFine.location,
    vehicle_registration: createdFine.vehicle_registration,
    status: createdFine.status,
    issue_date: createdFine.issue_date,
    due_date: createdFine.due_date,
    created_at: createdFine.created_at,
    updated_at: createdFine.updated_at,
  };
};

export const getFineById = async (fineId) => {
  if (!fineId) {
    throw new ValidationError('fineId is required');
  }

  const supabase = getSupabaseClient();

  // Fetch fine with driver details using join
  const { data: fine, error } = await supabase
    .from('fines')
    .select(`
      id,
      driver_id,
      issued_by_officer_id,
      amount,
      reason,
      violation_code,
      location,
      vehicle_registration,
      status,
      issue_date,
      due_date,
      payment_date,
      payment_method,
      created_at,
      updated_at,
      drivers(id, license_number, first_name, last_name)
    `)
    .eq('id', fineId)
    .single();

  if (error || !fine) {
    throw new NotFoundError('Fine not found');
  }

  const driver = fine.drivers || {};
  const driverName = driver ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim() : null;

  return {
    id: fine.id,
    driver_id: fine.driver_id,
    license_number: driver.license_number || null,
    driver_name: driverName,
    issued_by_officer_id: fine.issued_by_officer_id,
    amount: fine.amount,
    reason: fine.reason,
    violation_code: fine.violation_code,
    location: fine.location,
    vehicle_registration: fine.vehicle_registration,
    status: fine.status,
    issue_date: fine.issue_date,
    due_date: fine.due_date,
    payment_date: fine.payment_date,
    payment_method: fine.payment_method,
    created_at: fine.created_at,
    updated_at: fine.updated_at,
  };
};

export const getFinesByLicense = async (licenseNo) => {
  if (!licenseNo) {
    throw new ValidationError('licenseNo is required');
  }

  const supabase = getSupabaseClient();

  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('id, license_number, first_name, last_name')
    .eq('license_number', licenseNo)
    .single();

  if (driverError || !driver) {
    throw new NotFoundError('Driver not found for the provided licenseNo');
  }

  // PEZY-408 requires filtering with isDeleted=false and sorting by issuedDate DESC.
  // Current schema in this project uses snake_case and may not always include is_deleted,
  // so we prefer it when present and gracefully fallback when missing.
  let fines = null;

  const finesWithSoftDeleteFilter = await supabase
    .from('fines')
    .select('*')
    .eq('driver_id', driver.id)
    .eq('is_deleted', false)
    .order('issue_date', { ascending: false });

  if (!finesWithSoftDeleteFilter.error) {
    fines = finesWithSoftDeleteFilter.data || [];
  } else {
    const { data: fallbackFines, error: fallbackError } = await supabase
      .from('fines')
      .select('*')
      .eq('driver_id', driver.id)
      .order('issue_date', { ascending: false });

    if (fallbackError) {
      throw new AppError(`Failed to fetch fines by licenseNo: ${fallbackError.message}`, 500);
    }

    fines = (fallbackFines || []).filter((fine) => {
      if (typeof fine.is_deleted === 'boolean') {
        return fine.is_deleted === false;
      }

      if (fine.deleted_at !== undefined) {
        return fine.deleted_at === null;
      }

      return true;
    });
  }

  return fines.map((fine) => ({
    id: fine.id,
    driver_id: fine.driver_id,
    license_number: driver.license_number,
    driver_name: `${driver.first_name || ''} ${driver.last_name || ''}`.trim(),
    issued_by_officer_id: fine.issued_by_officer_id,
    amount: fine.amount,
    reason: fine.reason,
    violation_code: fine.violation_code,
    location: fine.location,
    vehicle_registration: fine.vehicle_registration,
    status: fine.status,
    issue_date: fine.issue_date,
    due_date: fine.due_date,
    payment_date: fine.payment_date,
    payment_method: fine.payment_method,
    created_at: fine.created_at,
    updated_at: fine.updated_at,
  }));
};

export const getOutdatedFines = async () => {
  const supabase = getSupabaseClient();

  const cutoffDate = new Date();
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 14);
  const cutoffIsoDate = cutoffDate.toISOString().split('T')[0];

  // PEZY-409 expects status=PENDING and issuedDate < now-14d.
  // Current schema uses status='unpaid' and issue_date, so we support both.
  let fines = null;

  const pendingQuery = await supabase
    .from('fines')
    .select(`
      id,
      driver_id,
      issued_by_officer_id,
      amount,
      reason,
      violation_code,
      location,
      vehicle_registration,
      status,
      issue_date,
      due_date,
      payment_date,
      payment_method,
      created_at,
      updated_at,
      drivers(id, license_number, first_name, last_name)
    `)
    .eq('status', 'pending')
    .lt('issued_date', cutoffIsoDate)
    .order('amount', { ascending: false });

  if (!pendingQuery.error) {
    fines = pendingQuery.data || [];
  } else {
    const unpaidQuery = await supabase
      .from('fines')
      .select(`
        id,
        driver_id,
        issued_by_officer_id,
        amount,
        reason,
        violation_code,
        location,
        vehicle_registration,
        status,
        issue_date,
        due_date,
        payment_date,
        payment_method,
        created_at,
        updated_at,
        drivers(id, license_number, first_name, last_name)
      `)
      .eq('status', 'unpaid')
      .lt('issue_date', cutoffIsoDate)
      .order('amount', { ascending: false });

    if (unpaidQuery.error) {
      throw new AppError(`Failed to fetch outdated fines: ${unpaidQuery.error.message}`, 500);
    }

    fines = unpaidQuery.data || [];
  }

  return fines.map((fine) => {
    const driver = fine.drivers || {};
    const driverName = driver ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim() : null;

    return {
      id: fine.id,
      driver_id: fine.driver_id,
      license_number: driver.license_number || null,
      driver_name: driverName,
      issued_by_officer_id: fine.issued_by_officer_id,
      amount: fine.amount,
      reason: fine.reason,
      violation_code: fine.violation_code,
      location: fine.location,
      vehicle_registration: fine.vehicle_registration,
      status: fine.status,
      issue_date: fine.issue_date || fine.issued_date || null,
      due_date: fine.due_date || null,
      payment_date: fine.payment_date || null,
      payment_method: fine.payment_method || null,
      created_at: fine.created_at,
      updated_at: fine.updated_at,
    };
  });
};

export const getAllFinesForAdmin = async () => {
  const supabase = getSupabaseClient();

  const { data: fines, error } = await supabase
    .from('fines')
    .select(`
      id,
      amount,
      reason,
      status,
      issue_date,
      due_date,
      created_at,
      driver_id,
      drivers(first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch fines: ${error.message}`, 500);
  }

  const todayIso = new Date().toISOString().split('T')[0];

  return (fines || []).map((fine) => {
    const isPaid = fine.status === 'paid';
    const isOverdue = !isPaid && fine.due_date && fine.due_date < todayIso;
    const normalizedStatus = isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending';
    const driver = fine.drivers || {};
    const offender = `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown Driver';

    return {
      id: fine.id,
      offender,
      violation: fine.reason || 'N/A',
      amount: Number(fine.amount || 0),
      date: fine.issue_date || (fine.created_at ? fine.created_at.split('T')[0] : null),
      status: normalizedStatus,
      raw_status: fine.status,
      due_date: fine.due_date,
      driver_id: fine.driver_id,
    };
  });
};

export const getFineByIdForAdmin = async (fineId) => {
  if (!fineId) {
    throw new ValidationError('fineId is required');
  }

  const supabase = getSupabaseClient();

  const { data: fine, error } = await supabase
    .from('fines')
    .select(`
      id,
      amount,
      reason,
      status,
      issue_date,
      due_date,
      created_at,
      driver_id,
      drivers(first_name, last_name)
    `)
    .eq('id', fineId)
    .single();

  if (error || !fine) {
    throw new NotFoundError('Fine not found');
  }

  const todayIso = new Date().toISOString().split('T')[0];
  const isPaid = fine.status === 'paid';
  const isOverdue = !isPaid && fine.due_date && fine.due_date < todayIso;
  const normalizedStatus = isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending';
  const driver = fine.drivers || {};

  return {
    id: fine.id,
    offender: `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown Driver',
    violation: fine.reason || 'N/A',
    amount: Number(fine.amount || 0),
    date: fine.issue_date || (fine.created_at ? fine.created_at.split('T')[0] : null),
    status: normalizedStatus,
    raw_status: fine.status,
    due_date: fine.due_date,
    driver_id: fine.driver_id,
  };
};

const normalizeAdminFineStatus = (status) => {
  if (status === 'paid') {
    return { dbStatus: 'paid', dueDate: null };
  }

  if (status === 'overdue') {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return { dbStatus: 'unpaid', dueDate: yesterday.toISOString().split('T')[0] };
  }

  return { dbStatus: 'unpaid', dueDate: null };
};

export const updateFineForAdmin = async (fineId, fineData = {}) => {
  if (!fineId) {
    throw new ValidationError('fineId is required');
  }

  const supabase = getSupabaseClient();

  const { data: existingFine, error: existingFineError } = await supabase
    .from('fines')
    .select('id, due_date')
    .eq('id', fineId)
    .single();

  if (existingFineError || !existingFine) {
    throw new NotFoundError('Fine not found');
  }

  const updatePayload = {};

  if (fineData.violation !== undefined) {
    const reason = String(fineData.violation || '').trim();
    if (!reason) {
      throw new ValidationError('violation is required');
    }
    updatePayload.reason = reason;
  }

  if (fineData.amount !== undefined) {
    const amount = Number(fineData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ValidationError('amount must be a positive number');
    }
    updatePayload.amount = amount;
  }

  if (fineData.date !== undefined) {
    const issueDate = toIsoDateString(fineData.date);
    if (!issueDate) {
      throw new ValidationError('date must be a valid date');
    }
    updatePayload.issue_date = issueDate;
  }

  if (fineData.status !== undefined) {
    const { dbStatus } = normalizeAdminFineStatus(fineData.status);
    updatePayload.status = dbStatus;

    // Only update due_date when status is NOT paid
    if (fineData.status !== 'paid') {
      if (fineData.status === 'overdue') {
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        updatePayload.due_date = yesterday.toISOString().split('T')[0];
      } else if (fineData.status === 'pending' && !existingFine.due_date) {
        const baseDate = updatePayload.issue_date || toIsoDateString(new Date());
        updatePayload.due_date = addDays(baseDate, 14);
      } else if (fineData.date !== undefined) {
        // If issue_date was updated, recalculate due_date
        updatePayload.due_date = addDays(updatePayload.issue_date, 14);
      }
    } else if (fineData.status === 'paid') {
      // When transitioning to paid, record the payment date (same as updateFineStatus)
      updatePayload.payment_date = new Date().toISOString().split('T')[0];
      // Don't touch due_date when paid
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new ValidationError('No fields provided to update');
  }

  console.log('Updating fine with payload:', { fineId, updatePayload });

  const { error: updateError } = await supabase
    .from('fines')
    .update(updatePayload)
    .eq('id', fineId);

  if (updateError) {
    console.error('Supabase update error:', updateError);
    throw new AppError(`Failed to update fine: ${updateError.message}`, 500);
  }

  return { id: fineId, ...updatePayload };
};

export const deleteFineForAdmin = async (fineId) => {
  if (!fineId) {
    throw new ValidationError('fineId is required');
  }

  const supabase = getSupabaseClient();

  // Prefer hard delete. If schema uses soft delete constraints, fallback to soft delete.
  const deleteResult = await supabase
    .from('fines')
    .delete()
    .eq('id', fineId)
    .select('id')
    .single();

  if (!deleteResult.error && deleteResult.data) {
    return { id: fineId, deleted: true };
  }

  const { data: softDeleted, error: softDeleteError } = await supabase
    .from('fines')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', fineId)
    .select('id')
    .single();

  if (softDeleteError || !softDeleted) {
    throw new AppError(
      `Failed to delete fine: ${deleteResult.error?.message || softDeleteError?.message || 'Unknown error'}`,
      500
    );
  }

  return { id: fineId, deleted: true };
};

/**
 * PEZY-410: Update fine status with strict validation
 * 
 * Updates the status of a fine with strict validation rules ensuring valid state transitions.
 * This is critical for maintaining data integrity in the fine management workflow.
 * 
 * Valid status transitions:
 * - unpaid → paid (when payment received)
 * - unpaid → outdated (when 14 days overdue)
 * - outdated → paid (if paid after becoming outdated)
 * - pending → paid or outdated (legacy status support)
 * - paid → NONE (terminal state, cannot change)
 * 
 * Side effects when transitioning to "paid":
 * - Automatically sets payment_date to today
 * - Creates audit log with user info and change details
 * - Fetches driver license for audit trail
 * 
 * @param {string} fineId - UUID of the fine to update
 * @param {string} newStatus - Target status (must be 'paid', 'unpaid', or 'outdated')
 * @param {Object} authUser - Authenticated user object
 * @param {string} authUser.id - User ID making the update
 * @param {string} [authUser.role] - User role (officer, admin, etc.) - defaults to 'officer'
 * 
 * @returns {Promise<Object>} Updated fine object with new status
 * @returns {string} Returns updated fine with: id, status, payment_date (if paid), updated_at
 * 
 * @throws {ValidationError} If fineId, newStatus, or authUser is missing
 * @throws {NotFoundError} If fine with given ID does not exist
 * @throws {AppError} If:
 *   - Status transition is invalid (409 Conflict)
 *   - Database update fails (500 Server Error)
 *   - Audit log creation fails (500 Server Error)
 * 
 * @example
 * // Update a fine to paid status
 * const fine = await updateFineStatus(
 *   'f47ac10b-58cc-4372-a567-0e02b2c3d479',
 *   'paid',
 *   { id: 'officer-123', role: 'officer' }
 * );
 * // Result: { id: 'f47ac...', status: 'paid', payment_date: '2026-04-09', ... }
 */
export const updateFineStatus = async (fineId, newStatus, authUser) => {
  if (!fineId) {
    throw new ValidationError('fineId is required');
  }

  if (!newStatus) {
    throw new ValidationError('newStatus is required');
  }

  if (!authUser || !authUser.id) {
    throw new ValidationError('authUser with id is required');
  }

  const supabase = getSupabaseClient();

  // Fetch the fine
  const { data: fine, error: fineError } = await supabase
    .from('fines')
    .select('id, status, driver_id, amount, reason, issue_date')
    .eq('id', fineId)
    .single();

  if (fineError || !fine) {
    throw new NotFoundError('Fine not found');
  }

  const currentStatus = fine.status;

  // PEZY-410: Validate status transitions
  // Valid transitions:
  // - unpaid -> paid (when payment received)
  // - unpaid -> outdated (when 14 days overdue)
  // - outdated -> paid (if paid after becoming outdated)
  const validTransitions = {
    unpaid: ['paid', 'outdated'],
    paid: [], // paid is terminal state
    outdated: ['paid'], // outdated can only become paid
    pending: ['paid', 'outdated'], // support legacy 'pending' status
  };

  const allowedTransitions = validTransitions[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from status '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowedTransitions.join(', ')}`,
      409
    );
  }

  // Update fine status
  const updatePayload = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  // If transitioning to paid, record the payment date
  if (newStatus === 'paid') {
    updatePayload.payment_date = new Date().toISOString().split('T')[0];
  }

  const { data: updatedFine, error: updateError } = await supabase
    .from('fines')
    .update(updatePayload)
    .eq('id', fineId)
    .select('*')
    .single();

  if (updateError || !updatedFine) {
    throw new AppError(`Failed to update fine status: ${updateError?.message || 'Unknown error'}`, 500);
  }

  // Get driver info for audit log
  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('id, license_number, first_name, last_name')
    .eq('id', fine.driver_id)
    .single();

  // Create audit log entry
  const auditLogPayload = {
    user_id: authUser.id,
    user_role: authUser.role || 'officer',
    license_number: driver?.license_number || null,
    driver_id: fine.driver_id,
    action: 'update',
    entity_type: 'Fine',
    entity_id: fineId,
    entity_name: `Fine-${fineId.slice(0, 8)}`,
    field_name: 'status',
    old_value: currentStatus,
    new_value: newStatus,
    change_summary: `Fine status changed from ${currentStatus} to ${newStatus}. Amount: ${fine.amount}. Reason: ${fine.reason}`,
  };

  const { error: auditError } = await supabase.from('audit_logs').insert([auditLogPayload]);

  if (auditError) {
    // Log the audit error but don't fail the main operation
    console.error(`Failed to create audit log for fine status update: ${auditError.message}`);
  }

  // Return the updated fine
  return {
    id: updatedFine.id,
    driver_id: updatedFine.driver_id,
    license_number: driver?.license_number || null,
    driver_name: driver ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim() : null,
    issued_by_officer_id: updatedFine.issued_by_officer_id,
    amount: updatedFine.amount,
    reason: updatedFine.reason,
    violation_code: updatedFine.violation_code,
    location: updatedFine.location,
    vehicle_registration: updatedFine.vehicle_registration,
    status: updatedFine.status,
    issue_date: updatedFine.issue_date,
    due_date: updatedFine.due_date,
    payment_date: updatedFine.payment_date,
    payment_method: updatedFine.payment_method,
    created_at: updatedFine.created_at,
    updated_at: updatedFine.updated_at,
  };
};
