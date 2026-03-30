import express from 'express';
import { getOnlineOfficers, getAllOfficers, getOfficerStatus } from '../controllers/officerController.js';
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/officers/online
 * Admin only - Get all officers currently logged in
 */
router.get('/online', authMiddleware, adminOnly, getOnlineOfficers);

/**
 * GET /api/officers
 * Admin only - Get all officers with their status
 */
router.get('/', authMiddleware, adminOnly, getAllOfficers);

/**
 * GET /api/officers/:id
 * Admin only - Get specific officer details
 */
router.get('/:id', authMiddleware, adminOnly, getOfficerStatus);

export default router;
