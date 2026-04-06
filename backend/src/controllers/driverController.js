import { getDriverByLicense } from '../services/driverService.js';

/**
 * Get Driver by License Number
 * GET /api/drivers/:licenseNo
 * Protected: requires authenticate + authorize('police_officer')
 * Returns: { success, driver }
 */
export const getDriverByLicenseNo = async (req, res, next) => {
  try {
    const { licenseNo } = req.params;

    const driver = await getDriverByLicense(licenseNo);

    return res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    next(error);
  }
};
