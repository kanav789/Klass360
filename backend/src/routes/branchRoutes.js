const express = require('express');
const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require('../controllers/branchController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { branchBodyRules, branchIdRule } = require('../validators/branchValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', branchBodyRules, validate, createBranch);
router.get('/', getBranches);
router.get('/:id', branchIdRule, validate, getBranchById);
router.put('/:id', [...branchIdRule, ...branchBodyRules], validate, updateBranch);
router.delete('/:id', branchIdRule, validate, deleteBranch);

module.exports = router;
