import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { uploadCriminalPhoto } from '../middlewares/uploadPhoto.js';
import { createCriminalRecord, updateCriminalRecord, getAllCriminalsRecords, deleteCriminalRecord, getCriminalRecord, uploadCriminalPhotoRecord, getAllCriminalsPublic, getCriminalByIdPublic } from '../controllers/criminalController.js';

const router = express.Router();

/**
 * CRIMINAL ROUTES - Combined Public & Police Officer/Admin
 * Base: /api/criminals
 */

// ============================================================
// PUBLIC CRIMINAL ROUTES - No Authentication Required
// ============================================================

/**
 * GET /api/criminals
 * Get all active/wanted criminals (public view)
 * Query parameters:
 *   - limit: number (default: 20, max: 100)
 *   - offset: number (default: 0)
 *   - wanted: boolean (filter by wanted status)
 *   - search: string (search in first_name/last_name)
 * Returns: { success, criminals: Array, total, limit, offset }
 * Public Access: YES
 */
router.get('/', getAllCriminalsPublic);

/**
 * GET /api/criminals/:id
 * Get a single criminal by ID (public view)
 * Returns: { success, criminal }
 * Public Access: YES
 */
router.get('/:id', getCriminalByIdPublic);

// ============================================================
// PROTECTED CRIMINAL ROUTES - Police Officer Authentication
// ============================================================

/**
 * POST /api/criminals/create
 * Create a new criminal record
 * Protected: requires police_officer role
 */
router.post('/create', authenticate, authorize('police_officer'), createCriminalRecord);

/**
 * POST /api/criminals/:id/photo
 * Upload or update criminal photo
 * Protected: requires police_officer role
 * Body: multipart/form-data with 'photo' field
 */
router.post('/:id/photo', 
  authenticate, 
  authorize('police_officer'),
  uploadCriminalPhoto.single('photo'),
  uploadCriminalPhotoRecord
);

/**
 * PATCH /api/criminals/:id
 * Update a criminal record
 * Protected: requires police_officer role
 */
router.patch('/:id', authenticate, authorize('police_officer'), updateCriminalRecord);

/**
 * DELETE /api/criminals/:id
 * Delete a criminal record (soft delete)
 * Protected: requires police_officer role
 */
router.delete('/:id', authenticate, authorize('police_officer'), deleteCriminalRecord);

export default router;
