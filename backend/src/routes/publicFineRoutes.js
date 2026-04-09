/**
 * Public Fine Routes - NO AUTHENTICATION REQUIRED
 * Used by web portal (fine-pay) for public driver fine lookups
 * 
 * These endpoints are public and don't require authentication
 * Mobile app uses the protected endpoints in fineRoutes.js
 */

import express from 'express';
import { getFinesByLicense } from '../controllers/fineController.js';

const router = express.Router();

/**
 * Get fines by driver license number (PUBLIC - NO AUTH REQUIRED)
 * GET /api/public-fines/driver/:licenseNo
 * 
 * Used by: Web portal FinePay page
 * Response: { success, driver, fines }
 */
router.get('/driver/:licenseNo', getFinesByLicense);

export default router;
