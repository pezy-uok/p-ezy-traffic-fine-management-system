import {
  createFine as createFineService,
  getFineById as getFineByIdService,
  getFinesByLicense as getFinesByLicenseService,
  getAllFinesForAdmin as getAllFinesForAdminService,
  getFineByIdForAdmin as getFineByIdForAdminService,
  updateFineForAdmin as updateFineForAdminService,
  deleteFineForAdmin as deleteFineForAdminService,
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
 * Get all fines for admin dashboard
 * GET /api/admin/fines
 */
export const getAllFinesForAdmin = async (req, res, next) => {
  try {
    const fines = await getAllFinesForAdminService();

    return res.status(200).json({
      success: true,
      fines,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a fine by ID from admin panel
 * GET /api/admin/fines/:fineId
 */
export const getFineByIdForAdmin = async (req, res, next) => {
  try {
    const { fineId } = req.params;
    const fine = await getFineByIdForAdminService(fineId);

    return res.status(200).json({
      success: true,
      fine,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a fine from admin panel
 * PATCH /api/admin/fines/:fineId
 */
export const updateFineForAdmin = async (req, res, next) => {
  try {
    const { fineId } = req.params;
    const fine = await updateFineForAdminService(fineId, req.body);

    return res.status(200).json({
      success: true,
      fine,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a fine from admin panel
 * DELETE /api/admin/fines/:fineId
 */
export const deleteFineForAdmin = async (req, res, next) => {
  try {
    const { fineId } = req.params;
    const result = await deleteFineForAdminService(fineId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update fine status unpaid to paid
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