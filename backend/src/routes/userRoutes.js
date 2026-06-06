const express = require('express');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { userBodyRules, userIdRule } = require('../validators/userValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', userBodyRules, validate, createUser);
router.get('/', getUsers);
router.get('/:id', userIdRule, validate, getUserById);
router.put('/:id', [...userIdRule, ...userBodyRules], validate, updateUser);
router.delete('/:id', userIdRule, validate, deleteUser);

module.exports = router;
