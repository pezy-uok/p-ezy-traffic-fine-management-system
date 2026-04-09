import express from 'express';
import { authenticate, authorize } from '../middlewares/authenticate.js';

const router = express.Router();

/**
 * Warning Routes
 * Base path: /api/warnings
 */

// Public endpoints (no auth required)
// TODO: Implement public warning endpoints

// Protected endpoints (auth required)
router.use(authenticate);

// Officer endpoints
// TODO: Implement officer warning endpoints

// Admin endpoints
router.use(authorize('admin'));
// TODO: Implement admin warning endpoints

export default router;
