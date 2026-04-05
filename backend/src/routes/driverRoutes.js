import express from 'express';
import { getDriverByLicenseNo } from '../controllers/driverController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

/**
 * GET /api/drivers/:licenseNo
 * Get driver information by license number
 * Protected: authenticate + authorize('police_officer')
 * Returns: { success, driver }
 */
router.get('/:licenseNo', authenticate, authorize('police_officer'), getDriverByLicenseNo);

export default router;
