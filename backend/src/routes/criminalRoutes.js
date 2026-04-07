import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { createCriminalRecord } from '../controllers/criminalController.js';

const router = express.Router();

/**
 * Criminal Management Routes
 * Base: /api/criminals
 */

/**
 * POST /api/criminals/create
 * Create a new criminal record
 * Protected: requires police_officer role
 */
router.post('/create', authenticate, authorize('police_officer'), createCriminalRecord);

export default router;
