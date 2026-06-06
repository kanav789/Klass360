const express = require('express');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Klass360 API is running',
  });
});

router.use('/auth', authRoutes);

module.exports = router;
