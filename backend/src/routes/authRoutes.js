const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
