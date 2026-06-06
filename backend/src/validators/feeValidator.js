const { body, param } = require('express-validator');

const feeBodyRules = [
  body('admissionId')
    .notEmpty()
    .withMessage('Admission is required')
    .isMongoId()
    .withMessage('Admission ID must be a valid MongoDB ID'),
  body('paidAmount')
    .notEmpty()
    .withMessage('Paid amount is required')
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a non-negative number'),
];

const feeIdRule = [param('id').isMongoId().withMessage('Invalid fee ID')];

module.exports = { feeBodyRules, feeIdRule };
