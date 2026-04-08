import { getSupabaseClient } from '../config/supabaseClient.js';
import { generatePayHereHash, formatAmount } from './paymentUtils.js';

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

  // 9. Build PayHere checkout params
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
