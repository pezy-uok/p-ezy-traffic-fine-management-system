import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { createCriminalRecord, updateCriminalRecord, getAllCriminalsRecords } from '../controllers/criminalController.js';

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
 * PATCH /api/criminals/:id
 * Update a criminal record
 * Protected: requires police_officer role
 */
router.patch('/:id', authenticate, authorize('police_officer'), updateCriminalRecord);

export default router;
