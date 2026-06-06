const { body, param } = require('express-validator');
const { LEAD_SOURCES } = require('../models/Lead');

const phoneRule = (field, label, required = true) => {
  const rule = body(field).trim();

  if (required) {
    rule.notEmpty().withMessage(`${label} is required`);
  } else {
    rule.optional({ values: 'falsy' });
  }

  return rule
    .matches(/^[6-9]\d{9}$/)
    .withMessage(`Please provide a valid 10-digit ${label.toLowerCase()}`);
};

const leadCreateRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ max: 100 })
    .withMessage('Lead name cannot exceed 100 characters'),
  phoneRule('number', 'Phone number'),
  phoneRule('whatsappNumber', 'WhatsApp number'),
  phoneRule('alternateNumber', 'Alternate number', false),
  body('branchId')
    .notEmpty()
    .withMessage('Branch is required')
    .isMongoId()
    .withMessage('Branch ID must be a valid MongoDB ID'),
  body('courseId')
    .notEmpty()
    .withMessage('Interested course is required')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ID'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Lead source is required')
    .isIn(LEAD_SOURCES)
    .withMessage(`Source must be one of: ${LEAD_SOURCES.join(', ')}`),
  body('assignedTo')
    .notEmpty()
    .withMessage('Assigned user is required')
    .isMongoId()
    .withMessage('Assigned user ID must be a valid MongoDB ID'),
];

const leadUpdateRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ max: 100 })
    .withMessage('Lead name cannot exceed 100 characters'),
  body('number')
    .optional()
    .custom(() => {
      throw new Error('Phone number cannot be updated');
    }),
  phoneRule('whatsappNumber', 'WhatsApp number'),
  phoneRule('alternateNumber', 'Alternate number', false),
  body('branchId')
    .notEmpty()
    .withMessage('Branch is required')
    .isMongoId()
    .withMessage('Branch ID must be a valid MongoDB ID'),
  body('courseId')
    .notEmpty()
    .withMessage('Interested course is required')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ID'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Lead source is required')
    .isIn(LEAD_SOURCES)
    .withMessage(`Source must be one of: ${LEAD_SOURCES.join(', ')}`),
  body('assignedTo')
    .notEmpty()
    .withMessage('Assigned user is required')
    .isMongoId()
    .withMessage('Assigned user ID must be a valid MongoDB ID'),
];

const leadIdRule = [
  param('id').isMongoId().withMessage('Invalid lead ID'),
];

module.exports = {
  leadCreateRules,
  leadUpdateRules,
  leadIdRule,
  LEAD_SOURCES,
};
