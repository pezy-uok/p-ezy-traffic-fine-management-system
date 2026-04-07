import { createCriminal, updateCriminal } from '../services/criminalService.js';

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
