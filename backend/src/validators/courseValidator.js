const { body, param } = require('express-validator');

const courseBodyRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ max: 150 })
    .withMessage('Course name cannot exceed 150 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Course category is required')
    .isLength({ max: 100 })
    .withMessage('Course category cannot exceed 100 characters'),
  body('durationInMonths')
    .notEmpty()
    .withMessage('Course duration is required')
    .isInt({ min: 1, max: 120 })
    .withMessage('Duration must be between 1 and 120 months'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('branchIds')
    .isArray({ min: 1 })
    .withMessage('At least one branch must be selected'),
  body('branchIds.*')
    .isMongoId()
    .withMessage('Each branch ID must be a valid MongoDB ID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const courseIdRule = [
  param('id').isMongoId().withMessage('Invalid course ID'),
];

module.exports = { courseBodyRules, courseIdRule };
