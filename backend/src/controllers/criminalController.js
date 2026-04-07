import { createCriminal } from '../services/criminalService.js';

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
