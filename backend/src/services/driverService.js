import { getSupabaseClient } from '../config/supabaseClient.js';
import { NotFoundError } from '../utils/errors.js';

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

  return {
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
  };
};
