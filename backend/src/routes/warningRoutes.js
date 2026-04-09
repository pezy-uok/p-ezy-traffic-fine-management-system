import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import {
  createWarning,
  getAllWarningsAdmin,
  getWarningById,
  getWarningsByLicense,
  updateWarningAdmin,
  deleteWarningAdmin,
  acknowledgeWarning,
} from '../controllers/warningController.js';

const router = express.Router();

/**
 * Warning Routes
 * Base path: /api/warnings
 */

// Protected routes (auth required)
router.use(authenticate);

/**
 * OFFICER ENDPOINTS
 */

// Create warning
router.post('/', createWarning);

// Get warnings by driver license
router.get('/driver/:licenseNo', getWarningsByLicense);

// Acknowledge warning (any user)
router.patch('/:id/acknowledge', acknowledgeWarning);

/**
 * ADMIN ENDPOINTS
 */

// Admin routes require admin role
router.use(authorize('admin'));

// Get all warnings with optional filters
router.get('/admin/all', getAllWarningsAdmin);

// Get warning by ID
router.get('/admin/:id', getWarningById);

// Update warning
router.patch('/admin/:id', updateWarningAdmin);

// Delete warning (soft delete)
router.delete('/admin/:id', deleteWarningAdmin);

export default router;
