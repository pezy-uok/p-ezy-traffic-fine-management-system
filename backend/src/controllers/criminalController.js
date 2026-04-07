import { createCriminal, updateCriminal, getAllCriminals } from '../services/criminalService.js';

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
