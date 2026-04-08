import crypto from 'crypto';

/**
 * Validates PayHere configuration environment variables
 * @throws {Error} If required environment variables are missing
 */
const validatePayHereConfig = () => {
  const requiredVars = ['PAYHERE_MERCHANT_ID', 'PAYHERE_MERCHANT_SECRET'];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing PayHere configuration: ${missing.join(', ')}`);
  }
};

/**
 * Validates input parameters for hash generation
 * @param {string} orderId - The order ID
 * @param {string|number} amount - The amount to be paid
 * @param {string} currency - The currency code (e.g., 'LKR')
 * @throws {Error} If any parameter is invalid
 */
const validateHashInputs = (orderId, amount, currency) => {
  if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
    throw new Error('orderId must be a non-empty string');
  }

  if (amount === null || amount === undefined || isNaN(amount)) {
    throw new Error('amount must be a valid number');
  }

  if (!currency || typeof currency !== 'string' || currency.trim() === '') {
    throw new Error('currency must be a non-empty string');
  }
};

/**
 * Generates PayHere payment hash
 *
 * Formula: MD5(merchant_id + order_id + amount.toFixed(2) + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
 *
 * @param {string} orderId - Unique order ID for the payment
 * @param {string|number} amount - Payment amount (will be formatted to 2 decimal places)
 * @param {string} currency - Currency code (e.g., 'LKR')
 * @returns {string} MD5 hash in uppercase
 * @throws {Error} If configuration is missing or inputs are invalid
 *
 * @example
 * const hash = generatePayHereHash('PEZY-1712345678901-ABC123', '4000.00', 'LKR');
 * // Returns: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6'
 */
export const generatePayHereHash = (orderId, amount, currency) => {
  try {
    // Validate environment variables
    validatePayHereConfig();

    // Validate input parameters
    validateHashInputs(orderId, amount, currency);

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    // Step 1: MD5 hash of merchant secret (uppercase)
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    // Step 2: Format amount to 2 decimal places
    const amountFormatted = parseFloat(amount).toFixed(2);

    // Step 3: Create final hash input string
    const hashInput = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;

    // Step 4: Generate MD5 hash and convert to uppercase
    const hash = crypto
      .createHash('md5')
      .update(hashInput)
      .digest('hex')
      .toUpperCase();

    return hash;
  } catch (error) {
    throw new Error(`Failed to generate PayHere hash: ${error.message}`);
  }
};

/**
 * Validates a PayHere hash against expected parameters
 * This can be used for webhook verification
 *
 * @param {string} providedHash - The hash to validate
 * @param {string} orderId - The order ID
 * @param {string|number} amount - The payment amount
 * @param {string} currency - The currency code
 * @returns {boolean} True if hash is valid, false otherwise
 *
 * @example
 * const isValid = validatePayHereHash(receivedHash, orderId, amount, currency);
 */
export const validatePayHereHash = (providedHash, orderId, amount, currency) => {
  try {
    const expectedHash = generatePayHereHash(orderId, amount, currency);
    return providedHash === expectedHash;
  } catch (error) {
    console.error('Hash validation error:', error.message);
    return false;
  }
};

/**
 * Formats amount to PayHere standard (2 decimal places)
 *
 * @param {string|number} amount - The amount to format
 * @returns {string} Formatted amount (e.g., '4000.00')
 * @throws {Error} If amount is invalid
 *
 * @example
 * formatAmount(4000) // Returns '4000.00'
 * formatAmount('4000.50') // Returns '4000.50'
 */
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    throw new Error('Invalid amount provided');
  }
  return parseFloat(amount).toFixed(2);
};
