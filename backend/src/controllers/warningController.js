import {
  createWarning as createWarningService,
  getWarningById as getWarningByIdService,
  getAllWarningsAdmin as getAllWarningsAdminService,
  getWarningsByLicense as getWarningsByLicenseService,
  updateWarningAdmin as updateWarningAdminService,
  deleteWarningAdmin as deleteWarningAdminService,
  acknowledgeWarning as acknowledgeWarningService,
} from '../services/warningService.js';

/**
 * Create a new warning (officer endpoint)
 * POST /api/warnings
 */
export const createWarning = async (req, res, next) => {
  try {
    const warning = await createWarningService(req.body, req.user);

    return res.status(201).json({
      success: true,
      warning,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all warnings (admin only)
 * GET /api/warnings/admin/all
 */
export const getAllWarningsAdmin = async (req, res, next) => {
  try {
    const { severity, acknowledged, driverId } = req.query;

    const filters = {};
    if (severity) filters.severity = severity;
    if (acknowledged !== undefined) filters.acknowledged = acknowledged === 'true';
    if (driverId) filters.driverId = driverId;

    const warnings = await getAllWarningsAdminService(filters);

    return res.status(200).json({
      success: true,
      count: warnings.length,
      warnings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get warning by ID (admin only)
 * GET /api/warnings/admin/:id
 */
export const getWarningById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warning = await getWarningByIdService(id);

    return res.status(200).json({
      success: true,
      warning,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get warnings by driver license (officer)
 * GET /api/warnings/driver/:licenseNo
 */
export const getWarningsByLicense = async (req, res, next) => {
  try {
    const { licenseNo } = req.params;
    const result = await getWarningsByLicenseService(licenseNo);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update warning (admin only)
 * PATCH /api/warnings/admin/:id
 */
export const updateWarningAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await updateWarningAdminService(id, req.body);

    return res.status(200).json({
      success: true,
      warning: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete warning (admin only)
 * DELETE /api/warnings/admin/:id
 */
export const deleteWarningAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteWarningAdminService(id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Acknowledge warning (driver or officer)
 * PATCH /api/warnings/:id/acknowledge
 */
export const acknowledgeWarning = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await acknowledgeWarningService(id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
