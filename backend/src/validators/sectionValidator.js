const { body, param } = require('express-validator');

const sectionBodyRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Section name is required')
    .isLength({ max: 150 })
    .withMessage('Section name cannot exceed 150 characters'),
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
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const sectionIdRule = [
  param('id').isMongoId().withMessage('Invalid section ID'),
];

module.exports = { sectionBodyRules, sectionIdRule };
