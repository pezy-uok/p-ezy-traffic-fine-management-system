import { getSupabaseClient } from '../config/supabaseClient.js';
import { AppError, ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';

const mapDriverRecord = (driver) => ({
  id: driver.id,
  first_name: driver.first_name,
  last_name: driver.last_name,
  email: driver.email,
  phone: driver.phone,
  license_number: driver.license_number,
  date_of_birth: driver.date_of_birth,
  address: driver.address,
  city: driver.city,
  country: driver.country,
  license_expiry_date: driver.license_expiry_date,
  vehicle_registration: driver.vehicle_registration,
  vehicle_type: driver.vehicle_type,
  total_violations: driver.total_violations,
  blacklisted: driver.blacklisted,
  created_at: driver.created_at,
  updated_at: driver.updated_at,
});

/**
 * Get driver by license number
 * @param {string} licenseNo - Driver's license number
 * @returns {Promise<Object>} Driver object with all details
 * @throws {NotFoundError} If driver not found
 */
export const getDriverByLicense = async (licenseNo) => {
  if (!licenseNo) {
    throw new Error('License number is required');
  }

  const supabase = getSupabaseClient();

  // Query driver from database
  const { data: driver, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('license_number', licenseNo)
    .single();

  if (error || !driver) {
    throw new NotFoundError('Driver not found');
  }

  return mapDriverRecord(driver);
};

export const getAllDriversForAdmin = async () => {
  const supabase = getSupabaseClient();

  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch drivers: ${error.message}`, 500);
  }

  return (drivers || []).map(mapDriverRecord);
};

export const getDriverByIdForAdmin = async (driverId) => {
  if (!driverId) {
    throw new ValidationError('driverId is required');
  }

  const supabase = getSupabaseClient();

  const { data: driver, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', driverId)
    .single();

  if (error || !driver) {
    throw new NotFoundError('Driver not found');
  }

  return mapDriverRecord(driver);
};

export const createDriverForAdmin = async (driverData = {}) => {
  const firstName = String(driverData.first_name || driverData.firstName || '').trim();
  const lastName = String(driverData.last_name || driverData.lastName || '').trim();
  const licenseNumber = String(driverData.license_number || driverData.licenseNumber || '').trim();
  const phone = String(driverData.phone || '').trim();

  if (!firstName) throw new ValidationError('first_name is required');
  if (!lastName) throw new ValidationError('last_name is required');
  if (!licenseNumber) throw new ValidationError('license_number is required');
  if (!phone) throw new ValidationError('phone is required');

  const payload = {
    first_name: firstName,
    last_name: lastName,
    license_number: licenseNumber,
    phone,
    email: driverData.email || null,
    city: driverData.city || null,
    vehicle_registration: driverData.vehicle_registration || driverData.vehicleRegistration || null,
    vehicle_type: driverData.vehicle_type || driverData.vehicleType || null,
    blacklisted: Boolean(driverData.blacklisted),
  };

  const supabase = getSupabaseClient();

  const { data: createdDriver, error } = await supabase
    .from('drivers')
    .insert([payload])
    .select('*')
    .single();

  if (error || !createdDriver) {
    if ((error?.message || '').toLowerCase().includes('duplicate')) {
      throw new ConflictError('Driver with provided unique fields already exists');
    }
    throw new AppError(`Failed to create driver: ${error?.message || 'Unknown error'}`, 500);
  }

  return mapDriverRecord(createdDriver);
};

export const updateDriverForAdmin = async (driverId, driverData = {}) => {
  if (!driverId) {
    throw new ValidationError('driverId is required');
  }

  const updates = {};

  if (driverData.first_name !== undefined || driverData.firstName !== undefined) {
    const firstName = String(driverData.first_name ?? driverData.firstName).trim();
    if (!firstName) throw new ValidationError('first_name cannot be empty');
    updates.first_name = firstName;
  }

  if (driverData.last_name !== undefined || driverData.lastName !== undefined) {
    const lastName = String(driverData.last_name ?? driverData.lastName).trim();
    if (!lastName) throw new ValidationError('last_name cannot be empty');
    updates.last_name = lastName;
  }

  if (driverData.license_number !== undefined || driverData.licenseNumber !== undefined) {
    const licenseNumber = String(driverData.license_number ?? driverData.licenseNumber).trim();
    if (!licenseNumber) throw new ValidationError('license_number cannot be empty');
    updates.license_number = licenseNumber;
  }

  if (driverData.phone !== undefined) {
    const phone = String(driverData.phone || '').trim();
    if (!phone) throw new ValidationError('phone cannot be empty');
    updates.phone = phone;
  }

  if (driverData.email !== undefined) updates.email = driverData.email || null;
  if (driverData.city !== undefined) updates.city = driverData.city || null;
  if (driverData.vehicle_registration !== undefined || driverData.vehicleRegistration !== undefined) {
    updates.vehicle_registration = driverData.vehicle_registration ?? driverData.vehicleRegistration ?? null;
  }
  if (driverData.vehicle_type !== undefined || driverData.vehicleType !== undefined) {
    updates.vehicle_type = driverData.vehicle_type ?? driverData.vehicleType ?? null;
  }
  if (driverData.blacklisted !== undefined) updates.blacklisted = Boolean(driverData.blacklisted);

  if (Object.keys(updates).length === 0) {
    throw new ValidationError('No fields provided to update');
  }

  const supabase = getSupabaseClient();

  const { data: updatedDriver, error } = await supabase
    .from('drivers')
    .update(updates)
    .eq('id', driverId)
    .select('*')
    .single();

  if (error || !updatedDriver) {
    if ((error?.message || '').toLowerCase().includes('duplicate')) {
      throw new ConflictError('Driver update violates unique constraints');
    }
    if ((error?.message || '').toLowerCase().includes('no rows')) {
      throw new NotFoundError('Driver not found');
    }
    throw new AppError(`Failed to update driver: ${error?.message || 'Unknown error'}`, 500);
  }

  return mapDriverRecord(updatedDriver);
};

export const deleteDriverForAdmin = async (driverId) => {
  if (!driverId) {
    throw new ValidationError('driverId is required');
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('drivers')
    .delete()
    .eq('id', driverId)
    .select('id')
    .single();

  if (error || !data) {
    const message = error?.message || '';
    if (message.toLowerCase().includes('foreign key')) {
      throw new ConflictError('Cannot delete driver because related records exist');
    }
    if (message.toLowerCase().includes('no rows')) {
      throw new NotFoundError('Driver not found');
    }
    throw new AppError(`Failed to delete driver: ${message || 'Unknown error'}`, 500);
  }

  return { id: driverId, deleted: true };
};
