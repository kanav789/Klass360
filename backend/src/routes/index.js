const express = require('express');
const authRoutes = require('./authRoutes');
const branchRoutes = require('./branchRoutes');
const courseRoutes = require('./courseRoutes');
const sectionRoutes = require('./sectionRoutes');
const userRoutes = require('./userRoutes');
const leadRoutes = require('./leadRoutes');
const enquiryRoutes = require('./enquiryRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Klass360 API is running',
  });
});

router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/courses', courseRoutes);
router.use('/sections', sectionRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/enquiries', enquiryRoutes);

module.exports = router;
