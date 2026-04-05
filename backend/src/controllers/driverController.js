import { getSupabaseClient } from '../config/supabaseClient.js';

/**
 * Get Driver by License Number
 * GET /api/drivers/:licenseNo
 * Protected: requires authenticate + authorize('police_officer')
 * Returns: { success, driver }
 */
export const getDriverByLicenseNo = async (req, res, next) => {
  try {
    const { licenseNo } = req.params;

    // Validate input
    if (!licenseNo) {
      return res.status(400).json({
        success: false,
        message: 'License number is required',
      });
    }

    const supabase = getSupabaseClient();

    // Query driver from database
    const { data: driver, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('license_number', licenseNo)
      .single();

    if (error || !driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    return res.status(200).json({
      success: true,
      driver: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};
