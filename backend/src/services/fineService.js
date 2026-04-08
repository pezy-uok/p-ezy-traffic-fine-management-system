import { getSupabaseClient } from '../config/supabaseClient.js';
import { AppError, NotFoundError, ValidationError } from '../utils/errors.js';

const MAX_UNPAID_FINES = 5;

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

const generateFineRef = () => {
  const year = new Date().getUTCFullYear();
  const sequence = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `PEZY-${year}-${sequence}`;
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

  const { count: unpaidCount, error: countError } = await supabase
    .from('fines')
    .select('id', { count: 'exact', head: true })
    .eq('driver_id', driver.id)
    .eq('status', 'unpaid');

  if (countError) {
    throw new AppError(`Failed to validate unpaid fine count: ${countError.message}`, 500);
  }

  if ((unpaidCount || 0) >= MAX_UNPAID_FINES) {
    throw new AppError('maxFinesExceeded', 409);
  }

  const issueDate = toIsoDateString(fineData.issuedDate || fineData.issue_date) || toIsoDateString(new Date());
  const dueDate = toIsoDateString(fineData.dueDate || fineData.due_date) || addDays(issueDate, 14);
  const fineRef = generateFineRef();

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

  // Fetch the fine WITHOUT soft-delete columns (they don't exist in this schema)
  const { data: fineData, error } = await supabase
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
      updated_at
    `)
    .eq('id', fineId)
    .single();

  if (error) {
    console.error('Supabase error fetching fine:', error);
    throw new NotFoundError('Fine not found');
  }

  if (!fineData) {
    throw new NotFoundError('Fine not found');
  }

  // Now fetch driver info separately if driver_id exists
  let driver = {};
  if (fineData.driver_id) {
    const { data: driverData } = await supabase
      .from('drivers')
      .select('id, license_number, first_name, last_name')
      .eq('id', fineData.driver_id)
      .single();

    driver = driverData || {};
  }

  return {
    id: fineData.id,
    driver_id: fineData.driver_id,
    license_number: driver.license_number || null,
    driver_name: driver ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim() : null,
    issued_by_officer_id: fineData.issued_by_officer_id,
    amount: fineData.amount,
    reason: fineData.reason,
    violation_code: fineData.violation_code,
    location: fineData.location,
    vehicle_registration: fineData.vehicle_registration,
    status: fineData.status,
    issue_date: fineData.issue_date,
    due_date: fineData.due_date,
    payment_date: fineData.payment_date,
    payment_method: fineData.payment_method,
    created_at: fineData.created_at,
    updated_at: fineData.updated_at,
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
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 30);
  const cutoffIsoDate = cutoffDate.toISOString().split('T')[0];

  // PEZY-409 expects status=PENDING and issuedDate < now-30d.
  // Current schema uses status='unpaid' and issue_date, so we support both.
  let fines = null;

  const pendingQuery = await supabase
    .from('fines')
    .select('*')
    .eq('status', 'pending')
    .lt('issued_date', cutoffIsoDate)
    .order('amount', { ascending: false });

  if (!pendingQuery.error) {
    fines = pendingQuery.data || [];
  } else {
    const unpaidQuery = await supabase
      .from('fines')
      .select('*')
      .eq('status', 'unpaid')
      .lt('issue_date', cutoffIsoDate)
      .order('amount', { ascending: false });

    if (unpaidQuery.error) {
      throw new AppError(`Failed to fetch outdated fines: ${unpaidQuery.error.message}`, 500);
    }

    fines = unpaidQuery.data || [];
  }

  return fines.map((fine) => ({
    id: fine.id,
    driver_id: fine.driver_id,
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
  }));
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
    const { dbStatus, dueDate } = normalizeAdminFineStatus(fineData.status);
    updatePayload.status = dbStatus;

    if (fineData.status === 'overdue') {
      updatePayload.due_date = dueDate;
    } else if (fineData.status === 'pending' && !existingFine.due_date) {
      const baseDate = updatePayload.issue_date || toIsoDateString(new Date());
      updatePayload.due_date = addDays(baseDate, 14);
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new ValidationError('No fields provided to update');
  }

  const { error: updateError } = await supabase
    .from('fines')
    .update(updatePayload)
    .eq('id', fineId);

  if (updateError) {
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
  // - unpaid -> outdated (when 30 days overdue)
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
