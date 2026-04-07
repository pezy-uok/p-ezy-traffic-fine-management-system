import {
  createFine as createFineService,
  getFineById as getFineByIdService,
  getFinesByLicense as getFinesByLicenseService,
  getOutdatedFines as getOutdatedFinesService,
  updateFineStatus as updateFineStatusService,
} from '../services/fineService.js';

/**
 * Create a new fine
 * POST /api/fines
 */
export const createFine = async (req, res, next) => {
  try {
    const fine = await createFineService(req.body, req.user);

    return res.status(201).json({
      success: true,
      fine,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get fine by ID
 * GET /api/fines/:fineId
 */
export const getFineById = async (req, res, next) => {
  try {
    const { fineId } = req.params;
    const fine = await getFineByIdService(fineId);

    return res.status(200).json({
      success: true,
      fine,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get fines by driver license number
 * GET /api/fines/driver/:licenseNo
 */
export const getFinesByLicense = async (req, res, next) => {
  try {
    const { licenseNo } = req.params;
    const fines = await getFinesByLicenseService(licenseNo);

    return res.status(200).json({
      success: true,
      fines,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get outdated fines
 * GET /api/fines/outdated
 */
export const getOutdatedFines = async (req, res, next) => {
  try {
    const fines = await getOutdatedFinesService();

    return res.status(200).json({
      success: true,
      fines,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update fine status
 * PATCH /api/fines/:fineId/status
 */
export const updateFineStatus = async (req, res, next) => {
  try {
    const { fineId } = req.params;
    const { status } = req.body;

    const fine = await updateFineStatusService(fineId, status, req.user);

    return res.status(200).json({
      success: true,
      fine,
    });
  } catch (error) {
    next(error);
  }
};