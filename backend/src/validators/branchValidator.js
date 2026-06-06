const { body, param } = require('express-validator');

const branchBodyRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Branch name is required')
    .isLength({ max: 150 })
    .withMessage('Branch name cannot exceed 150 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Branch code is required')
    .isLength({ max: 20 })
    .withMessage('Branch code cannot exceed 20 characters')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Branch code can only contain letters, numbers, and hyphens'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Branch address is required')
    .isLength({ max: 500 })
    .withMessage('Branch address cannot exceed 500 characters'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
];

const branchIdRule = [
  param('id').isMongoId().withMessage('Invalid branch ID'),
];

module.exports = { branchBodyRules, branchIdRule };
