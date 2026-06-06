const { param } = require('express-validator');

const studentIdRule = [param('id').isMongoId().withMessage('Invalid student ID')];

module.exports = { studentIdRule };
