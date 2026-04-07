import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { uploadCriminalPhoto } from '../middlewares/uploadPhoto.js';
import { createCriminalRecord, updateCriminalRecord, getAllCriminalsRecords, deleteCriminalRecord, getCriminalRecord, uploadCriminalPhotoRecord } from '../controllers/criminalController.js';

const router = express.Router();

/**
 * Criminal Management Routes
 * Base: /api/criminals
 */

/**
 * GET /api/criminals
 * Get all criminals with optional filtering and pagination
 * Protected: requires police_officer role
 */
router.get('/', authenticate, authorize('police_officer'), getAllCriminalsRecords);

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
 * GET /api/criminals/:id
 * Get a criminal record by ID
 * Protected: requires police_officer role
 */
router.get('/:id', authenticate, authorize('police_officer'), getCriminalRecord);

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
