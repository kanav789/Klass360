const express = require('express');
const authRoutes = require('./authRoutes');
const branchRoutes = require('./branchRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Klass360 API is running',
  });
});

router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);

module.exports = router;
