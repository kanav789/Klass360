const { body, param } = require('express-validator');

const branchBodyRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Branch name is required')
    .isLength({ max: 150 })
    .withMessage('Branch name cannot exceed 150 characters'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Branch address is required')
    .isLength({ max: 500 })
    .withMessage('Branch address cannot exceed 500 characters'),
];

const branchIdRule = [
  param('id').isMongoId().withMessage('Invalid branch ID'),
];

module.exports = { branchBodyRules, branchIdRule };
