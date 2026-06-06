const express = require('express');
const authRoutes = require('./authRoutes');
const branchRoutes = require('./branchRoutes');
const courseRoutes = require('./courseRoutes');
const sectionRoutes = require('./sectionRoutes');
const userRoutes = require('./userRoutes');
const leadRoutes = require('./leadRoutes');
const enquiryRoutes = require('./enquiryRoutes');
const admissionRoutes = require('./admissionRoutes');
const studentRoutes = require('./studentRoutes');
const feeRoutes = require('./feeRoutes');

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
router.use('/batches', sectionRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/admissions', admissionRoutes);
router.use('/students', studentRoutes);
router.use('/fees', feeRoutes);

module.exports = router;
