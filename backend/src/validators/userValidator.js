const { body, param } = require('express-validator');
const { USER_ROLES } = require('../models/User');

const userBodyRules = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(USER_ROLES)
    .withMessage(`Role must be one of: ${USER_ROLES.join(', ')}`),
  body('branchId')
    .notEmpty()
    .withMessage('Branch is required')
    .isMongoId()
    .withMessage('Branch ID must be a valid MongoDB ID'),
];

const userIdRule = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

module.exports = { userBodyRules, userIdRule, USER_ROLES };
