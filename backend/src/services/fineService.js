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

export const getFineById = async () => {
  return notImplemented('getFineById');
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

export const updateFineStatus = async () => {
  return notImplemented('updateFineStatus');
};
