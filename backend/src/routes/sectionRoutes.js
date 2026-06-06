const express = require('express');
const {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
  activateSection,
  deactivateSection,
} = require('../controllers/sectionController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sectionBodyRules, sectionIdRule } = require('../validators/sectionValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', sectionBodyRules, validate, createSection);
router.get('/', getSections);
router.get('/:id', sectionIdRule, validate, getSectionById);
router.put('/:id', [...sectionIdRule, ...sectionBodyRules], validate, updateSection);
router.patch('/:id/activate', sectionIdRule, validate, activateSection);
router.patch('/:id/deactivate', sectionIdRule, validate, deactivateSection);
router.delete('/:id', sectionIdRule, validate, deleteSection);

module.exports = router;
