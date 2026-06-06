const express = require('express');
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  activateCourse,
  deactivateCourse,
} = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { courseBodyRules, courseIdRule } = require('../validators/courseValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', courseBodyRules, validate, createCourse);
router.get('/', getCourses);
router.get('/:id', courseIdRule, validate, getCourseById);
router.put('/:id', [...courseIdRule, ...courseBodyRules], validate, updateCourse);
router.patch('/:id/activate', courseIdRule, validate, activateCourse);
router.patch('/:id/deactivate', courseIdRule, validate, deactivateCourse);
router.delete('/:id', courseIdRule, validate, deleteCourse);

module.exports = router;
