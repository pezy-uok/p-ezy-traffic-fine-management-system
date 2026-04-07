import crypto from 'crypto';
import { getSupabaseClient } from '../config/supabaseClient.js';

/**
 * Generate a webhook verification hash
 * HMAC-SHA256(transaction_id + status, WEBHOOK_SECRET)
 */
const generateHash = (transactionId, status) => {
  const secret = process.env.WEBHOOK_SECRET || 'mock_webhook_secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${transactionId}:${status}`)
    .digest('hex');
};

/**
 * POST /api/payments/initiate
 * Authenticated - creates a pending payment for a fine
 * Body: { fine_id, payment_method }
 * Returns: { success, payment, webhook_hash }
 */
export const initiatePayment = async (req, res, next) => {
  try {
    const { fine_id, payment_method } = req.body;

    if (!fine_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'fine_id and payment_method are required',
      });
    }

    const validMethods = ['cash', 'credit_card', 'debit_card', 'online'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: `payment_method must be one of: ${validMethods.join(', ')}`,
      });
    }

    const supabase = getSupabaseClient();

    // Verify the fine exists and is unpaid
    const { data: fine, error: fineError } = await supabase
      .from('fines')
      .select('*')
      .eq('id', fine_id)
      .single();

    if (fineError || !fine) {
      return res.status(404).json({
        success: false,
        message: 'Fine not found',
      });
    }

    if (fine.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This fine has already been paid',
      });
    }

    // Generate mock transaction identifiers
    const timestamp = Date.now();
    const transaction_id = `TXN-${timestamp}`;
    const reference_number = `REF-${Math.floor(10000 + Math.random() * 90000)}`;

    // Insert pending payment record
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        fine_id,
        amount: fine.amount,
        payment_method,
        status: 'pending',
        transaction_id,
        reference_number,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Payment insert error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment record',
      });
    }

    // Generate hash for webhook verification (simulate sending to payment gateway)
    const webhook_hash = generateHash(transaction_id, 'completed');

    return res.status(201).json({
      success: true,
      payment: {
        id: payment.id,
        fine_id: payment.fine_id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        status: payment.status,
        transaction_id: payment.transaction_id,
        reference_number: payment.reference_number,
        created_at: payment.created_at,
      },
      // In a real gateway this hash would be sent by the gateway to the webhook.
      // Here it is returned so the client/tester can call the webhook endpoint.
      webhook_hash,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/webhook
 * Public - no auth, verified by HMAC hash
 * Body: { transaction_id, status, hash }
 * Updates payment and fine status accordingly
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const { transaction_id, status, hash } = req.body;

    if (!transaction_id || !status || !hash) {
      return res.status(400).json({
        success: false,
        message: 'transaction_id, status, and hash are required',
      });
    }

    const validStatuses = ['completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Verify the hash
    const expectedHash = generateHash(transaction_id, status);
    if (hash !== expectedHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook hash — request could not be verified',
      });
    }

    const supabase = getSupabaseClient();

    // Find the payment by transaction_id
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transaction_id)
      .single();

    if (findError || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this transaction_id',
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`,
      });
    }

    // Update payment status
    const paymentUpdate = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === 'completed') {
      paymentUpdate.payment_date = new Date().toISOString();
    }

    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update(paymentUpdate)
      .eq('id', payment.id);

    if (paymentUpdateError) {
      console.error('Payment update error:', paymentUpdateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update payment status',
      });
    }

    // If completed, mark the fine as paid
    if (status === 'completed') {
      const { error: fineUpdateError } = await supabase
        .from('fines')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString(),
          payment_method: payment.payment_method,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.fine_id);

      if (fineUpdateError) {
        console.error('Fine update error:', fineUpdateError);
        // Payment updated successfully — log but don't fail the webhook
      }
    }

    return res.status(200).json({
      success: true,
      message: `Payment ${status} successfully processed`,
    });
  } catch (error) {
    next(error);
  }
};
