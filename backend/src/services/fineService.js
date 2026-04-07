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

export const getFinesByLicense = async () => {
  return notImplemented('getFinesByLicense');
};

export const getOutdatedFines = async () => {
  return notImplemented('getOutdatedFines');
};

export const updateFineStatus = async () => {
  return notImplemented('updateFineStatus');
};
