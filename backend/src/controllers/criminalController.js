import { createCriminal, updateCriminal, getAllCriminals, deleteCriminal, getCriminalById } from '../services/criminalService.js';
import { deletePhotoFile } from '../middlewares/uploadPhoto.js';

/**
 * Create a new criminal record
 * POST /api/criminals/create
 * Protected: requires authenticate + authorize('police_officer')
 * Returns: { success, criminal }
 */
export const createCriminalRecord = async (req, res, next) => {
  try {
    const criminalData = req.body;

    const criminal = await createCriminal(criminalData);

    return res.status(201).json({
      success: true,
      criminal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a criminal record by ID
 * GET /api/criminals/:id
 * Protected: requires authenticate + authorize('police_officer')
 * Returns: { success, criminal }
 */
export const getCriminalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const criminal = await getCriminalById(id);

    return res.status(200).json({
      success: true,
      criminal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a criminal record
 * PATCH /api/criminals/:id
 * Protected: requires authenticate + authorize('police_officer')
 * Returns: { success, criminal }
 */
export const updateCriminalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const criminal = await updateCriminal(id, updateData);

    return res.status(200).json({
      success: true,
      criminal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all criminals with optional filters
 * GET /api/criminals
 * Protected: requires authenticate + authorize('police_officer')
 * Query parameters:
 *   - limit: number (default: 50, max: 1000)
 *   - offset: number (default: 0)
 *   - status: 'active' | 'inactive' | 'deceased' | 'deported'
 *   - wanted: boolean
 *   - search: string (search in first_name or last_name)
 *   - orderBy: string (default: 'created_at')
 *   - orderDirection: 'asc' | 'desc' (default: 'desc')
 * Returns: { success, criminals: Array, total, limit, offset }
 */
export const getAllCriminalsRecords = async (req, res, next) => {
  try {
    const queryOptions = {
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      status: req.query.status,
      wanted: req.query.wanted === 'true' ? true : req.query.wanted === 'false' ? false : undefined,
      search: req.query.search,
      orderBy: req.query.orderBy,
      orderDirection: req.query.orderDirection,
    };

    // Remove undefined values
    Object.keys(queryOptions).forEach(key => queryOptions[key] === undefined && delete queryOptions[key]);

    const result = await getAllCriminals(queryOptions);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all criminals for admin dashboard
 * GET /api/admin/criminals
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, criminals: Array, total, limit, offset }
 */
export const getAllCriminalsForAdmin = async (req, res, next) => {
  try {
    const queryOptions = {
      limit: req.query.limit ? parseInt(req.query.limit) : 1000,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      status: req.query.status,
      wanted: req.query.wanted === 'true' ? true : req.query.wanted === 'false' ? false : undefined,
      search: req.query.search,
      orderBy: req.query.orderBy,
      orderDirection: req.query.orderDirection,
    };

    Object.keys(queryOptions).forEach(key => queryOptions[key] === undefined && delete queryOptions[key]);

    const result = await getAllCriminals(queryOptions);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a criminal record (soft delete)
 * DELETE /api/criminals/:id
 * Protected: requires authenticate + authorize('police_officer')
 * Returns: { success, deleted: true, message, criminal_id }
 */
export const deleteCriminalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await deleteCriminal(id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload or update criminal photo
 * POST /api/criminals/:id/photo
 * Protected: requires authenticate + authorize('police_officer')
 * Body: multipart/form-data with 'photo' field
 * Returns: { success, criminal }
 */
export const uploadCriminalPhotoRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo file provided',
      });
    }

    // Construct photo path
    const photoPath = `/uploads/criminals/${req.file.filename}`;
    const photoSize = req.file.size;

    // Get current criminal to check for existing photo
    const currentCriminal = await getCriminalById(id);

    // Delete old photo if it exists
    if (currentCriminal.photo_path) {
      deletePhotoFile(currentCriminal.photo_path);
    }

    // Update criminal record with new photo path
    const criminal = await updateCriminal(id, {
      photo_path: photoPath,
      photo_size: photoSize,
    });

    return res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      criminal,
    });
  } catch (error) {
    // Delete uploaded file if something goes wrong
    if (req.file) {
      deletePhotoFile(`/uploads/criminals/${req.file.filename}`);
    }
    next(error);
  }
};
