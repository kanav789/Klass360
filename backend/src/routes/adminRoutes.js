const express = require('express');
const { getAdmins, updateAdmin } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getAdminsRules, updateAdminRules } = require('../validators/adminValidator');

const router = express.Router();

router.use(authenticate, authorize('superadmin'));

router.get('/', getAdminsRules, validate, getAdmins);
router.patch('/:id', updateAdminRules, validate, updateAdmin);

module.exports = router;
