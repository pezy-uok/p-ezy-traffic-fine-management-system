import { handleWebhook, initiatePayment } from '../services/paymentService.js';

/**
 * Initiate a PayHere payment session for one or more fines.
 * POST /api/payments/initiate
 */
export const initiatePaymentHandler = async (req, res, next) => {
  try {
    const { fineIds, licenseNo } = req.body;
    const result = await initiatePayment(fineIds, licenseNo);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

/**
 * Receive PayHere notify_url callbacks.
 * POST /api/payments/webhook
 */
export const handlePaymentWebhookHandler = async (req, res, next) => {
  try {
    const result = await handleWebhook(req.body);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};
