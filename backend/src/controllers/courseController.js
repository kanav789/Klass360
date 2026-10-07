const Branch = require('../models/Branch');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  getBranchIdFromQuery,
  getInstituteIdFromQuery,
} = require('../utils/queryFilters');
const {
  getOwnedInstituteIds,
  buildInstituteFilter,
  ensureInstituteAccess,
} = require('../utils/tenancy');

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
    instituteId: course.instituteId,
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

// Returns the branch documents after verifying they exist, are owned by the
// admin, and all belong to one institute.
const validateBranchIds = async (branchIds, ownedInstituteIds) => {
  if (!Array.isArray(branchIds) || branchIds.length === 0) {
    throw new AppError('Select at least one branch', 400);
  }

  const uniqueBranchIds = [...new Set(branchIds.map((id) => id.toString()))];

  const branches = await Branch.find({ _id: { $in: uniqueBranchIds } });

  if (branches.length !== uniqueBranchIds.length) {
    throw new AppError('One or more selected branches do not exist', 400);
  }

  const outsideInstitute = branches.some(
    (branch) =>
      !branch.instituteId ||
      (ownedInstituteIds !== null &&
        !ownedInstituteIds.some(
          (id) => String(id) === String(branch.instituteId),
        )),
  );

  if (outsideInstitute) {
    throw new AppError('One or more selected branches do not exist', 400);
  }

  const instituteIds = new Set(
    branches.map((branch) => String(branch.instituteId)),
  );

  if (instituteIds.size > 1) {
    throw new AppError(
      'All selected branches must belong to the same institute',
      400,
    );
  }

  return branches;
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

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branches = await validateBranchIds(branchIds, ownedInstituteIds);
  const instituteId = branches[0].instituteId;

  const existingCourse = await Course.findOne({
    instituteId,
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
  });

  if (existingCourse) {
    throw new AppError('A course with this name already exists', 409);
  }

  const course = await Course.create({
    instituteId,
    name,
    category,
    durationInMonths,
    description,
    branchIds: branches.map((branch) => branch._id),
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
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branchId = getBranchIdFromQuery(req.query);
  const requestedInstituteId = getInstituteIdFromQuery(req.query);

  const filter = buildInstituteFilter(ownedInstituteIds, requestedInstituteId);

  if (branchId) {
    filter.branchIds = branchId;
  }

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
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const course = await getPopulatedCourse(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, course.instituteId);

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

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, course.instituteId);

  if (name && name.toLowerCase() !== course.name.toLowerCase()) {
    const existingCourse = await Course.findOne({
      instituteId: course.instituteId,
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
      _id: { $ne: course._id },
    });

    if (existingCourse) {
      throw new AppError('A course with this name already exists', 409);
    }
  }

  if (branchIds) {
    course.branchIds = (
      await validateBranchIds(branchIds, ownedInstituteIds)
    ).map((branch) => branch._id);
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
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, course.instituteId);

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
  });
});

const activateCourse = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, course.instituteId);

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
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, course.instituteId);

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
