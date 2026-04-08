import express from 'express';
import {
  submitTip,
  getTipStatus,
  getAllTipsAdmin,
  getTipByIdAdmin,
  updateTipStatus,
  assignTip,
  updateTipCategory,
  deleteTip,
} from '../controllers/tipController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

/**
 * RATE LIMITING FOR PUBLIC ENDPOINTS
 */
const tipSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour per IP
  message: 'Too many tips submitted from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Allow requests without proper IP (for testing)
    return !req.ip;
  },
});

/**
 * PUBLIC ENDPOINTS (No Authentication)
 */

// POST /api/tips/submit - Submit a new tip
router.post('/submit', tipSubmitLimiter, submitTip);

// GET /api/tips/:tipReference/status - Check tip status
router.get('/:tipReference/status', getTipStatus);

/**
 * ADMIN ENDPOINTS (Authentication Required)
 */

// GET /api/tips/admin/all - List all tips
router.get('/admin/all', authenticate, authorize('admin', 'police_officer'), getAllTipsAdmin);

// GET /api/tips/admin/:id - Get tip details
router.get('/admin/:id', authenticate, authorize('admin', 'police_officer'), getTipByIdAdmin);

// PATCH /api/tips/admin/:id/status - Update tip status
router.patch(
  '/admin/:id/status',
  authenticate,
  authorize('admin', 'police_officer'),
  updateTipStatus
);

// PATCH /api/tips/admin/:id/assign - Assign tip
router.patch(
  '/admin/:id/assign',
  authenticate,
  authorize('admin', 'police_officer'),
  assignTip
);

// PATCH /api/tips/admin/:id/category - Update category
router.patch(
  '/admin/:id/category',
  authenticate,
  authorize('admin', 'police_officer'),
  updateTipCategory
);

// DELETE /api/tips/admin/:id - Delete tip
router.delete(
  '/admin/:id',
  authenticate,
  authorize('admin', 'police_officer'),
  deleteTip
);

export default router;
