import express from 'express';
import {
  handlePaymentWebhookHandler,
  initiatePaymentHandler,
} from '../controllers/paymentController.js';
import { validatePayHereWebhookSignature } from '../middlewares/validatePayHereWebhookSignature.js';

const router = express.Router();

/**
 * POST /api/payments/initiate
 * Body: { fineIds: string[], licenseNo: string }
 * Returns: PayHere checkout parameters for the frontend.
 */
router.post('/initiate', initiatePaymentHandler);
router.post('/webhook', validatePayHereWebhookSignature, handlePaymentWebhookHandler);

export default router;
