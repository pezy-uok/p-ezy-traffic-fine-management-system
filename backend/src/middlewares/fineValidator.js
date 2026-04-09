/**
 * Fine Validation Rules
 * PEZY-413: Express-validator rules for POST /api/fines
 *
 * Validates:
 * - licenseNo: Not empty, valid format
 * - amount: Positive number
 * - reason: Not empty
 * - violationType: In allowed list
 * - issuedDate: Valid date (optional)
 */

import { body, validationResult } from 'express-validator';

/**
 * Allowed violation types
 * Can be expanded based on traffic law categories
 */
const ALLOWED_VIOLATION_TYPES = [
  'speeding',
  'red_light',
  'parking_violation',
  'no_parking',
  'illegal_turn',
  'unsafe_driving',
  'expired_license',
  'expired_registration',
  'no_seat_belt',
  'phone_usage',
  'dangerous_driving',
  'hit_and_run',
  'other',
];

/**
 * Validation rules for POST /api/fines
 * Returns array of validation rules to use as middleware
 *
 * @returns {Array} Array of validation rules
 */
export const validateCreateFine = [
  // Validate licenseNo
  body('licenseNo')
    .trim()
    .notEmpty()
    .withMessage('License number is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('License number must be between 3-20 characters')
    .matches(/^[A-Z0-9\-]+$/i)
    .withMessage('License number must contain only alphanumeric characters and hyphens'),

  // Validate amount
  body('amount')
    .exists()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0')
    .toFloat(),

  // Validate reason
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5-500 characters'),

  // Validate violationType (optional but if provided, must be in allowed list)
  body('violationType')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(ALLOWED_VIOLATION_TYPES)
    .withMessage(`Violation type must be one of: ${ALLOWED_VIOLATION_TYPES.join(', ')}`),

  // Validate issuedDate (optional but if provided, must be valid date)
  body('issuedDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Issued date must be a valid ISO 8601 date (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      if (date > today) {
        throw new Error('Issued date cannot be in the future');
      }
      return true;
    }),

  // Validate issuedByOfficerId (optional but if provided, must be UUID)
  body('issuedByOfficerId')
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage('Issued by officer ID must be a valid UUID'),

  // Validate location (optional but if provided, must be string)
  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2-255 characters'),

  // Validate vehicleRegistration (optional but if provided, must be string)
  body('vehicleRegistration')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Vehicle registration must be between 2-50 characters'),
];

/**
 * Middleware to handle validation results
 * Extracts validation errors and returns 400 response with field errors
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Extract field-specific errors
    const fieldErrors = {};
    errors.array().forEach((error) => {
      if (!fieldErrors[error.param]) {
        fieldErrors[error.param] = [];
      }
      fieldErrors[error.param].push({
        field: error.param,
        message: error.msg,
        value: error.value,
      });
    });

    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      errors: fieldErrors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * Get list of allowed violation types
 * Useful for frontend/mobile to display dropdown options
 *
 * @returns {Array} Array of allowed violation types
 */
export const getAllowedViolationTypes = () => {
  return ALLOWED_VIOLATION_TYPES;
};

export default {
  validateCreateFine,
  handleValidationErrors,
  getAllowedViolationTypes,
};
