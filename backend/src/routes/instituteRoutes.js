const express = require('express');
const {
  createInstitute,
  getInstitutes,
  getActiveInstitute,
  getInstituteById,
  updateInstitute,
  deleteInstitute,
} = require('../controllers/instituteController');
const { authenticate } = require('../middleware/auth');
const { optionalLogoUpload } = require('../middleware/uploadLogo');
const validate = require('../middleware/validate');
const {
  instituteBodyRules,
  instituteIdRule,
} = require('../validators/instituteValidator');

const router = express.Router();

router.use(authenticate);

router.get('/active', getActiveInstitute);
router.post('/', optionalLogoUpload, instituteBodyRules, validate, createInstitute);
router.get('/', getInstitutes);
router.get('/:id', instituteIdRule, validate, getInstituteById);
router.put(
  '/:id',
  instituteIdRule,
  optionalLogoUpload,
  instituteBodyRules,
  validate,
  updateInstitute,
);
router.delete('/:id', instituteIdRule, validate, deleteInstitute);

module.exports = router;
