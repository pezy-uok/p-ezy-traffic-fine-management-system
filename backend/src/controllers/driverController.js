import {
  createDriverForAdmin,
  deleteDriverForAdmin,
  getAllDriversForAdmin,
  getDriverByIdForAdmin,
  getDriverByLicense,
  updateDriverForAdmin,
} from '../services/driverService.js';

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

/**
 * Get all drivers for admin
 * GET /api/admin/drivers
 */
export const getAllDriversAdmin = async (req, res, next) => {
  try {
    const drivers = await getAllDriversForAdmin();

    return res.status(200).json({
      success: true,
      drivers,
      total: drivers.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single driver by ID for admin
 * GET /api/admin/drivers/:driverId
 */
export const getDriverByIdAdmin = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await getDriverByIdForAdmin(driverId);

    return res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create driver from admin panel
 * POST /api/admin/drivers
 */
export const createDriverAdmin = async (req, res, next) => {
  try {
    const driver = await createDriverForAdmin(req.body);

    return res.status(201).json({
      success: true,
      driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update driver from admin panel
 * PUT /api/admin/drivers/:driverId
 */
export const updateDriverAdmin = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await updateDriverForAdmin(driverId, req.body);

    return res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete driver from admin panel
 * DELETE /api/admin/drivers/:driverId
 */
export const deleteDriverAdmin = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const result = await deleteDriverForAdmin(driverId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
