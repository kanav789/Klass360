const express = require('express');
const {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} = require('../controllers/enquiryController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { enquiryBodyRules, enquiryIdRule } = require('../validators/enquiryValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', enquiryBodyRules, validate, createEnquiry);
router.get('/', getEnquiries);
router.get('/:id', enquiryIdRule, validate, getEnquiryById);
router.put('/:id', [...enquiryIdRule, ...enquiryBodyRules], validate, updateEnquiry);
router.delete('/:id', enquiryIdRule, validate, deleteEnquiry);

module.exports = router;
