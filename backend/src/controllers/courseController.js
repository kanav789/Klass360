const Branch = require('../models/Branch');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getBranchIdFromQuery } = require('../utils/queryFilters');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatBranchRef = (branch) => ({
  id: branch._id,
  name: branch.name,
  code: branch.code,
});

const formatCourse = (course) => {
  const branches = Array.isArray(course.branchIds)
    ? course.branchIds
        .filter((branch) => branch && typeof branch === 'object' && branch._id)
        .map(formatBranchRef)
    : [];

  const branchIds = branches.length
    ? branches.map((branch) => branch.id)
    : course.branchIds.map((id) => id.toString());

  return {
    id: course._id,
    name: course.name,
    category: course.category,
    durationInMonths: course.durationInMonths,
    description: course.description,
    branchIds,
    branches,
    isActive: course.isActive,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
};

const validateBranchIds = async (branchIds) => {
  const uniqueBranchIds = [...new Set(branchIds.map((id) => id.toString()))];

  const branches = await Branch.find({ _id: { $in: uniqueBranchIds } });

  if (branches.length !== uniqueBranchIds.length) {
    throw new AppError('One or more selected branches do not exist', 400);
  }

  return uniqueBranchIds;
};

const getPopulatedCourse = (id) =>
  Course.findById(id).populate('branchIds', 'name code');

const createCourse = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    durationInMonths,
    description = '',
    branchIds,
    isActive = true,
  } = req.body;

  const existingCourse = await Course.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
  });

  if (existingCourse) {
    throw new AppError('A course with this name already exists', 409);
  }

  const validatedBranchIds = await validateBranchIds(branchIds);

  const course = await Course.create({
    name,
    category,
    durationInMonths,
    description,
    branchIds: validatedBranchIds,
    isActive,
  });

  const populatedCourse = await getPopulatedCourse(course._id);

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: { course: formatCourse(populatedCourse) },
  });
});

const getCourses = asyncHandler(async (req, res) => {
  const branchId = getBranchIdFromQuery(req.query);
  const filter = branchId ? { branchIds: branchId } : {};

  const courses = await Course.find(filter)
    .populate('branchIds', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      courses: courses.map(formatCourse),
      count: courses.length,
    },
  });
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await getPopulatedCourse(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { course: formatCourse(course) },
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    durationInMonths,
    description,
    branchIds,
    isActive,
  } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (name && name.toLowerCase() !== course.name.toLowerCase()) {
    const existingCourse = await Course.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
      _id: { $ne: course._id },
    });

    if (existingCourse) {
      throw new AppError('A course with this name already exists', 409);
    }
  }

  if (branchIds) {
    course.branchIds = await validateBranchIds(branchIds);
  }

  course.name = name ?? course.name;
  course.category = category ?? course.category;
  course.durationInMonths = durationInMonths ?? course.durationInMonths;
  course.description = description ?? course.description;

  if (typeof isActive === 'boolean') {
    course.isActive = isActive;
  }

  await course.save();

  const populatedCourse = await getPopulatedCourse(course._id);

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: { course: formatCourse(populatedCourse) },
  });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
  });
});

const activateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  course.isActive = true;
  await course.save();

  const populatedCourse = await getPopulatedCourse(course._id);

  res.status(200).json({
    success: true,
    message: 'Course activated successfully',
    data: { course: formatCourse(populatedCourse) },
  });
});

const deactivateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  course.isActive = false;
  await course.save();

  const populatedCourse = await getPopulatedCourse(course._id);

  res.status(200).json({
    success: true,
    message: 'Course deactivated successfully',
    data: { course: formatCourse(populatedCourse) },
  });
});

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  activateCourse,
  deactivateCourse,
};
