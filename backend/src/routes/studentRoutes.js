const express = require('express');
const {
  getStudents,
  getStudentById,
} = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { studentIdRule } = require('../validators/studentValidator');

const router = express.Router();

router.use(authenticate);

router.get('/', getStudents);
router.get('/:id', studentIdRule, validate, getStudentById);

module.exports = router;
