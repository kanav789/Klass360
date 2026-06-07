const { body, param } = require('express-validator');

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const instituteBodyRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Institute name is required')
    .isLength({ max: 150 })
    .withMessage('Institute name cannot exceed 150 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('isActive')
    .optional()
    .customSanitizer(parseBoolean)
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const instituteIdRule = [
  param('id').isMongoId().withMessage('Invalid institute ID'),
];

module.exports = { instituteBodyRules, instituteIdRule };
