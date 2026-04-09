/**
 * Fine Reference ID Generator Utility
 * PEZY-411: Generate unique, human-readable reference IDs for fines
 *
 * Reference ID Format: FIN-YYYYMMDD-XXXXXX
 * - Prefix: FIN (Fine)
 * - Date: YYYYMMDD (8 digits) - date fine is issued
 * - Random: XXXXXX (6 alphanumeric characters) - ensures uniqueness
 *
 * Usage:
 * import { generateFineReference } from './utils/fineReferenceGenerator.js';
 * const referenceId = generateFineReference();
 * // Returns: FIN-20260409-A3K2B9
 */

/**
 * Generate a unique fine reference ID
 * Format: FIN-YYYYMMDD-XXXXXX
 *
 * @returns {string} Unique fine reference ID
 *
 * @example
 * const fineRef = generateFineReference();
 * // Returns: "FIN-20260409-B7M3K2"
 */
export const generateFineReference = () => {
  // Get current date in YYYYMMDD format
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

  // Generate 6-character random alphanumeric string
  // Uses base36 (0-9, a-z) and converts to uppercase
  const randomId = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()
    .padEnd(6, '0'); // Pad with zeros if needed

  // Combine: FIN-YYYYMMDD-XXXXXX
  return `FIN-${date}-${randomId}`;
};

/**
 * Generate fine reference with custom date
 * Useful for generating historical fines or testing
 *
 * @param {Date} date - The date to use for the reference ID
 * @returns {string} Fine reference ID with provided date
 *
 * @example
 * const pastDate = new Date('2026-01-15');
 * const fineRef = generateFineReferenceWithDate(pastDate);
 * // Returns: "FIN-20260115-K9L2M5"
 */
export const generateFineReferenceWithDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error('Invalid date provided to generateFineReferenceWithDate');
  }

  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const randomId = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()
    .padEnd(6, '0');

  return `FIN-${dateStr}-${randomId}`;
};

/**
 * Validate fine reference ID format
 * Checks if the provided string matches the expected format
 *
 * @param {string} referenceId - The reference ID to validate
 * @returns {boolean} True if valid format, false otherwise
 *
 * @example
 * validateFineReference('FIN-20260409-A3K2B9');  // true
 * validateFineReference('TIP-20260409-A3K2B9');  // false (wrong prefix)
 * validateFineReference('FIN-2026409-A3K2B9');   // false (wrong date format)
 */
export const validateFineReference = (referenceId) => {
  if (typeof referenceId !== 'string') {
    return false;
  }

  // Pattern: FIN-YYYYMMDD-XXXXXX (where X is alphanumeric)
  const pattern = /^FIN-\d{8}-[A-Z0-9]{6}$/;
  return pattern.test(referenceId);
};

/**
 * Extract date from fine reference ID
 * Parses the date component from the reference ID
 *
 * @param {string} referenceId - The reference ID to parse
 * @returns {Date|null} Parsed date or null if invalid
 *
 * @example
 * const date = extractDateFromFineReference('FIN-20260409-A3K2B9');
 * // Returns: Date object for April 9, 2026
 */
export const extractDateFromFineReference = (referenceId) => {
  if (!validateFineReference(referenceId)) {
    return null;
  }

  try {
    const dateStr = referenceId.split('-')[1]; // Get YYYYMMDD
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10);
    const day = parseInt(dateStr.substring(6, 8), 10);

    const date = new Date(year, month - 1, day); // month is 0-indexed

    // Validate the date is real (e.g., not Feb 30)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
};

export default {
  generateFineReference,
  generateFineReferenceWithDate,
  validateFineReference,
  extractDateFromFineReference,
};
