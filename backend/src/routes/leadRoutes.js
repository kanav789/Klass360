const express = require('express');
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} = require('../controllers/leadController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  leadCreateRules,
  leadUpdateRules,
  leadIdRule,
} = require('../validators/leadValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', leadCreateRules, validate, createLead);
router.get('/', getLeads);
router.get('/:id', leadIdRule, validate, getLeadById);
router.put('/:id', [...leadIdRule, ...leadUpdateRules], validate, updateLead);
router.delete('/:id', leadIdRule, validate, deleteLead);

module.exports = router;
