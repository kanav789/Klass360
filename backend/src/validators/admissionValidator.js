const { body, param } = require('express-validator');
const { ADMISSION_STATUSES } = require('../models/Admission');

const admissionBodyRules = [
  body('enquiryId')
    .notEmpty()
    .withMessage('Enquiry is required')
    .isMongoId()
    .withMessage('Enquiry ID must be a valid MongoDB ID'),
  body('leadId')
    .notEmpty()
    .withMessage('Lead is required')
    .isMongoId()
    .withMessage('Lead ID must be a valid MongoDB ID'),
  body('courseId')
    .notEmpty()
    .withMessage('Course is required')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ID'),
  body('branchId')
    .notEmpty()
    .withMessage('Branch is required')
    .isMongoId()
    .withMessage('Branch ID must be a valid MongoDB ID'),
  body('batchId')
    .notEmpty()
    .withMessage('Batch is required')
    .isMongoId()
    .withMessage('Batch ID must be a valid MongoDB ID'),
  body('admissionDate')
    .notEmpty()
    .withMessage('Admission date is required')
    .isISO8601()
    .withMessage('Admission date must be a valid date'),
  body('totalFee')
    .notEmpty()
    .withMessage('Total fee is required')
    .isFloat({ min: 0 })
    .withMessage('Total fee must be a non-negative number'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ADMISSION_STATUSES)
    .withMessage(`Status must be one of: ${ADMISSION_STATUSES.join(', ')}`),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('qualification')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Qualification cannot exceed 200 characters'),
];

const admissionIdRule = [
  param('id').isMongoId().withMessage('Invalid admission ID'),
];

module.exports = { admissionBodyRules, admissionIdRule, ADMISSION_STATUSES };
