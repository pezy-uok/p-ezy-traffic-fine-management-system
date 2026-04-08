import express from 'express';
import { initiatePayment, handleWebhook } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

/**
 * POST /api/payments/initiate
 * Authenticated - initiates a payment for a fine
 * Body: { fine_id, payment_method }
 * Returns: { success, payment, webhook_hash }
 */
router.post('/initiate', authenticate, initiatePayment);

/**
 * POST /api/payments/webhook
 * Public - no auth, verified by HMAC hash
 * Body: { transaction_id, status, hash }
 */
router.post('/webhook', handleWebhook);

export default router;
