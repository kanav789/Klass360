const { body, param } = require('express-validator');
const { ENQUIRY_STATUSES } = require('../models/Enquiry');

const enquiryBodyRules = [
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
  body('assignedTo')
    .notEmpty()
    .withMessage('Assigned user is required')
    .isMongoId()
    .withMessage('Assigned user ID must be a valid MongoDB ID'),
  body('enquiryDate')
    .notEmpty()
    .withMessage('Enquiry date is required')
    .isISO8601()
    .withMessage('Enquiry date must be a valid date'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ENQUIRY_STATUSES)
    .withMessage(`Status must be one of: ${ENQUIRY_STATUSES.join(', ')}`),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
];

const enquiryIdRule = [
  param('id').isMongoId().withMessage('Invalid enquiry ID'),
];

module.exports = { enquiryBodyRules, enquiryIdRule, ENQUIRY_STATUSES };
