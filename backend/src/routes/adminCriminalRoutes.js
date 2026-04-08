import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import {
  getAllCriminalsAdmin,
  getCriminalByIdAdmin,
  createCriminalAdmin,
  updateCriminalAdmin,
  deleteCriminalAdmin,
  restoreCriminalAdmin,
  hardDeleteCriminalAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * Admin Criminal Management Routes
 * Base: /api/admin/criminals
 * All routes protected: requires authenticate + authorize('admin')
 */

/**
 * GET /api/admin/criminals
 * Get all criminals (including deleted if requested)
 * Query parameters:
 *   - limit: number (default: 50, max: 1000)
 *   - offset: number (default: 0)
 *   - status: 'active' | 'inactive' | 'deceased' | 'deported'
 *   - wanted: boolean
 *   - search: string (search in first_name or last_name)
 *   - orderBy: string (default: 'created_at')
 *   - orderDirection: 'asc' | 'desc' (default: 'desc')
 *   - includeDeleted: boolean (default: false - includes soft-deleted records)
 *   - showDeletedOnly: boolean (default: false - shows only deleted records)
 * Protected: requires admin role
 */
router.get('/', authenticate, authorize('admin'), getAllCriminalsAdmin);

/**
 * GET /api/admin/criminals/:id
 * Get a criminal record by ID (includes deleted records)
 * Protected: requires admin role
 */
router.get('/:id', authenticate, authorize('admin'), getCriminalByIdAdmin);

/**
 * POST /api/admin/criminals/create
 * Create a new criminal record
 * Protected: requires admin role
 */
router.post('/create', authenticate, authorize('admin'), createCriminalAdmin);

/**
 * PATCH /api/admin/criminals/:id
 * Update a criminal record
 * Protected: requires admin role
 */
router.patch('/:id', authenticate, authorize('admin'), updateCriminalAdmin);

/**
 * DELETE /api/admin/criminals/:id
 * Soft delete a criminal record
 * Protected: requires admin role
 */
router.delete('/:id', authenticate, authorize('admin'), deleteCriminalAdmin);

/**
 * PATCH /api/admin/criminals/:id/restore
 * Restore a soft-deleted criminal record
 * Protected: requires admin role
 */
router.patch('/:id/restore', authenticate, authorize('admin'), restoreCriminalAdmin);

/**
 * DELETE /api/admin/criminals/:id/permanent
 * Permanently delete a criminal record (irreversible)
 * Protected: requires admin role
 */
router.delete('/:id/permanent', authenticate, authorize('admin'), hardDeleteCriminalAdmin);

export default router;
