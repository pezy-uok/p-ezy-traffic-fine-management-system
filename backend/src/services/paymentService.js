import { getSupabaseClient } from '../config/supabaseClient.js';
import { generatePayHereHash, formatAmount } from './paymentUtils.js';

const createPendingPaymentRecords = async (supabase, orderId, fines) => {
  const paymentRows = fines.map((fine) => ({
    fine_id: fine.id,
    amount: parseFloat(fine.amount).toFixed(2),
    payment_method: 'credit_card',
    status: 'pending',
    reference_number: orderId,
  }));

  const { error } = await supabase.from('payments').insert(paymentRows);

  if (error) {
    throw {
      status: 500,
      message: `Failed to create pending payment records: ${error.message}`,
    };
  }
};

const updateFineStatuses = async (supabase, fineIds) => {
  const paymentDate = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('fines')
    .update({
      status: 'paid',
      payment_date: paymentDate,
      payment_method: 'credit_card',
    })
    .in('id', fineIds);

  if (error) {
    throw {
      status: 500,
      message: `Failed to update fine statuses: ${error.message}`,
    };
  }
};

const triggerReceiptGeneration = async ({ orderId, paymentId, fineIds }) => {
  // Placeholder until a receipt service/module is introduced.
  console.log('Payment receipt queued', {
    orderId,
    paymentId,
    fineIds,
  });
};

const triggerReceiptEmail = async ({ orderId, paymentId, driver }) => {
  // Placeholder until an email provider is integrated.
  if (!driver?.email) {
    console.log('Skipping payment receipt email: driver email not available', {
      orderId,
      paymentId,
      licenseNo: driver?.license_number,
    });
    return;
  }

  console.log('Payment receipt email queued', {
    orderId,
    paymentId,
    email: driver.email,
  });
};

/**
 * Initiate a PayHere payment for one or more fines
 *
 * @param {string[]} fineIds   - Array of fine UUIDs to pay
 * @param {string}   licenseNo - Driver's license number
 * @returns {object} PayHere checkout params ready to submit
 */
export const initiatePayment = async (fineIds, licenseNo) => {
  if (!fineIds || !Array.isArray(fineIds) || fineIds.length === 0) {
    throw { status: 400, message: 'fineIds must be a non-empty array' };
  }

  if (!licenseNo) {
    throw { status: 400, message: 'licenseNo is required' };
  }

  const supabase = getSupabaseClient();

  // 1. Fetch driver by license number
  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('id, first_name, last_name, email, phone, license_number')
    .eq('license_number', licenseNo)
    .single();

  if (driverError || !driver) {
    throw { status: 404, message: 'Driver not found for the given license number' };
  }

  // 2. Fetch all requested fines
  const { data: fines, error: finesError } = await supabase
    .from('fines')
    .select('id, driver_id, amount, status, reason')
    .in('id', fineIds);

  if (finesError || !fines || fines.length === 0) {
    throw { status: 404, message: 'No fines found for the provided IDs' };
  }

  // 3. Validate all requested fines were actually found
  if (fines.length !== fineIds.length) {
    const foundIds = fines.map((f) => f.id);
    const missing = fineIds.filter((id) => !foundIds.includes(id));
    throw {
      status: 404,
      message: `The following fine IDs were not found: ${missing.join(', ')}`,
    };
  }

  // 4. Validate all fines belong to this driver
  const wrongOwner = fines.filter((f) => f.driver_id !== driver.id);
  if (wrongOwner.length > 0) {
    throw {
      status: 403,
      message: 'One or more fines do not belong to the given license number',
    };
  }

  // 5. Validate all fines are unpaid (pending)
  const notUnpaid = fines.filter((f) => f.status !== 'unpaid');
  if (notUnpaid.length > 0) {
    const details = notUnpaid.map((f) => `${f.id} (${f.status})`).join(', ');
    throw {
      status: 400,
      message: `The following fines are not payable: ${details}`,
    };
  }

  // 6. Sum total amount
  const total = fines.reduce((sum, f) => sum + parseFloat(f.amount), 0);
  const totalFormatted = formatAmount(total);

  // 7. Generate unique order ID
  const orderId = `PEZY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const currency = 'LKR';

  // 8. Generate PayHere hash
  const hash = generatePayHereHash(orderId, totalFormatted, currency);

  // 9. Persist pending payment records so the webhook can reconcile by order ID
  await createPendingPaymentRecords(supabase, orderId, fines);

  // 10. Build PayHere checkout params
  const checkoutParams = {
    sandbox: process.env.PAYHERE_SANDBOX === 'true',
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    return_url: process.env.PAYHERE_RETURN_URL,
    cancel_url: process.env.PAYHERE_CANCEL_URL,
    notify_url: process.env.PAYHERE_NOTIFY_URL,
    order_id: orderId,
    items: fines.map((f) => f.reason).join(' | '),
    amount: totalFormatted,
    currency,
    hash,
    // Customer details from driver record
    first_name: driver.first_name,
    last_name: driver.last_name,
    email: driver.email,
    phone: driver.phone,
    // Metadata for reference
    custom_1: fineIds.join(','),       // fine IDs for webhook processing
    custom_2: driver.license_number,   // license number for reference
  };

  return {
    orderId,
    total: totalFormatted,
    currency,
    fineCount: fines.length,
    driver: {
      licenseNo: driver.license_number,
      name: `${driver.first_name} ${driver.last_name}`,
      email: driver.email,
      phone: driver.phone,
    },
    checkoutParams,
  };
};

/**
 * Handle a PayHere payment notification webhook.
 *
 * @param {object} payload - PayHere webhook payload
 * @returns {object} webhook processing result
 */
export const handleWebhook = async (payload) => {
  const {
    order_id: orderId,
    payment_id: paymentId,
    status_code: statusCode,
    custom_1: customFineIds,
    custom_2: licenseNo,
  } = payload || {};

  if (!orderId || statusCode === undefined) {
    throw {
      status: 400,
      message: 'Missing required PayHere webhook fields',
    };
  }

  const supabase = getSupabaseClient();
  const { data: payments, error: paymentLookupError } = await supabase
    .from('payments')
    .select('id, fine_id, status, reference_number')
    .eq('reference_number', orderId);

  if (paymentLookupError) {
    throw {
      status: 500,
      message: `Failed to find payment records for order ID ${orderId}: ${paymentLookupError.message}`,
    };
  }

  if (!payments || payments.length === 0) {
    throw {
      status: 404,
      message: `No payment records found for order ID ${orderId}`,
    };
  }

  if (`${statusCode}` !== '2') {
    const mappedStatus = `${statusCode}` === '0' ? 'pending' : 'failed';

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: mappedStatus,
        transaction_id: paymentId || null,
      })
      .eq('reference_number', orderId);

    if (updateError) {
      throw {
        status: 500,
        message: `Failed to update payment status for order ID ${orderId}: ${updateError.message}`,
      };
    }

    return {
      orderId,
      paymentId: paymentId || null,
      status: mappedStatus,
      message: 'Webhook received for non-success payment state',
    };
  }

  const alreadyCompleted = payments.every((payment) => payment.status === 'completed');
  const fineIds = customFineIds
    ? customFineIds.split(',').map((id) => id.trim()).filter(Boolean)
    : payments.map((payment) => payment.fine_id).filter(Boolean);

  if (!alreadyCompleted) {
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        transaction_id: paymentId,
        payment_date: new Date().toISOString(),
      })
      .eq('reference_number', orderId);

    if (updateError) {
      throw {
        status: 500,
        message: `Failed to mark payment as completed for order ID ${orderId}: ${updateError.message}`,
      };
    }

    if (fineIds.length > 0) {
      await updateFineStatuses(supabase, fineIds);
    }
  }

  let driver = null;
  if (licenseNo) {
    const { data: driverData } = await supabase
      .from('drivers')
      .select('license_number, email, first_name, last_name')
      .eq('license_number', licenseNo)
      .maybeSingle();

    driver = driverData || null;
  }

  if (!alreadyCompleted) {
    await triggerReceiptGeneration({ orderId, paymentId, fineIds });
    await triggerReceiptEmail({ orderId, paymentId, driver });
  }

  return {
    orderId,
    paymentId,
    fineIds,
    status: 'completed',
    message: alreadyCompleted
      ? 'Webhook already processed for this order'
      : 'Webhook processed successfully',
  };
};
