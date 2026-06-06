const express = require('express');
const {
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
} = require('../controllers/feeController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { feeBodyRules, feeIdRule } = require('../validators/feeValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', feeBodyRules, validate, createFee);
router.get('/', getFees);
router.get('/:id', feeIdRule, validate, getFeeById);
router.put('/:id', [...feeIdRule, ...feeBodyRules], validate, updateFee);
router.delete('/:id', feeIdRule, validate, deleteFee);

module.exports = router;
