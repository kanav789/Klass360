const { body, param, query } = require('express-validator');

const adminIdRule = param('id').isMongoId().withMessage('Invalid admin ID');

const getAdminsRules = [
  query('search').optional().isString().trim(),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
];

const updateAdminRules = [
  adminIdRule,
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];

module.exports = { getAdminsRules, updateAdminRules };
