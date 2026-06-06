const express = require('express');
const {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
} = require('../controllers/admissionController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  admissionBodyRules,
  admissionIdRule,
} = require('../validators/admissionValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', admissionBodyRules, validate, createAdmission);
router.get('/', getAdmissions);
router.get('/:id', admissionIdRule, validate, getAdmissionById);
router.put(
  '/:id',
  [...admissionIdRule, ...admissionBodyRules],
  validate,
  updateAdmission,
);
router.delete('/:id', admissionIdRule, validate, deleteAdmission);

module.exports = router;
