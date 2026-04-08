import express from 'express';
import {
  handlePaymentWebhookHandler,
  initiatePaymentHandler,
} from '../controllers/paymentController.js';

const router = express.Router();

/**
 * POST /api/payments/initiate
 * Body: { fineIds: string[], licenseNo: string }
 * Returns: PayHere checkout parameters for the frontend.
 */
router.post('/initiate', initiatePaymentHandler);
router.post('/webhook', handlePaymentWebhookHandler);

export default router;
