import crypto from 'crypto';

const generateExpectedSignature = (merchantId, orderId, amount, currency, statusCode) => {
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  return crypto
    .createHash('md5')
    .update(`${merchantId}${orderId}${amount}${currency}${statusCode}${hashedSecret}`)
    .digest('hex')
    .toUpperCase();
};

export const validatePayHereWebhookSignature = (req, res, next) => {
  try {
    const {
      merchant_id: merchantId,
      order_id: orderId,
      payhere_amount: amount,
      payhere_currency: currency,
      status_code: statusCode,
      md5sig,
    } = req.body || {};

    if (!merchantId || !orderId || !amount || !currency || statusCode === undefined || !md5sig) {
      return res.status(400).json({
        success: false,
        message: 'Missing required PayHere webhook fields',
      });
    }

    if (!process.env.PAYHERE_MERCHANT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'PAYHERE_MERCHANT_SECRET is not configured',
      });
    }

    const expectedSignature = generateExpectedSignature(
      merchantId,
      orderId,
      amount,
      currency,
      statusCode
    );

    if (expectedSignature !== md5sig) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PayHere notification signature',
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to validate PayHere webhook signature',
      error: error.message,
    });
  }
};
