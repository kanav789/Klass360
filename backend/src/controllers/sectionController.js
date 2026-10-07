const Branch = require('../models/Branch');
const Course = require('../models/Course');
const Section = require('../models/Section');
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

const formatCourseRef = (course) => ({
  id: course._id,
  name: course.name,
  category: course.category,
});

const formatBranchRef = (branch) => ({
  id: branch._id,
  name: branch.name,
  code: branch.code,
});

const formatSection = (section) => ({
  id: section._id,
  name: section.name,
  courseId: section.courseId?._id || section.courseId,
  branchId: section.branchId?._id || section.branchId,
  instituteId: section.instituteId,
  course:
    section.courseId && typeof section.courseId === 'object'
      ? formatCourseRef(section.courseId)
      : null,
  branch:
    section.branchId && typeof section.branchId === 'object'
      ? formatBranchRef(section.branchId)
      : null,
  startDate: section.startDate,
  endDate: section.endDate,
  isActive: section.isActive,
  createdAt: section.createdAt,
  updatedAt: section.updatedAt,
});

const validateDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError('Invalid start or end date', 400);
  }

  if (end <= start) {
    throw new AppError('End date must be after start date', 400);
  }

  return { start, end };
};

const validateCourseAndBranch = async (courseId, branchId) => {
  const [course, branch] = await Promise.all([
    Course.findById(courseId),
    Branch.findById(branchId),
  ]);

  if (!course) {
    throw new AppError('Selected course does not exist', 400);
  }

  if (!branch) {
    throw new AppError('Selected branch does not exist', 400);
  }

  const isBranchLinkedToCourse = course.branchIds.some(
    (id) => id.toString() === branchId.toString(),
  );

  if (!isBranchLinkedToCourse) {
    throw new AppError('Selected course is not available for this branch', 400);
  }

  return { course, branch };
};

const getPopulatedSection = (id) =>
  Section.findById(id)
    .populate('courseId', 'name category')
    .populate('branchId', 'name code');

const createSection = asyncHandler(async (req, res) => {
  const {
    name,
    courseId,
    branchId,
    startDate,
    endDate,
    isActive = true,
  } = req.body;

  await validateCourseAndBranch(courseId, branchId);
  const { start, end } = validateDates(startDate, endDate);

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branch = await Branch.findById(branchId).select('instituteId');
  const course = await Course.findById(courseId).select('instituteId');

  ensureInstituteAccess(ownedInstituteIds, branch.instituteId);

  if (String(course.instituteId) !== String(branch.instituteId)) {
    throw new AppError('Selected course is not available for this branch', 400);
  }

  const section = await Section.create({
    name,
    courseId,
    branchId,
    instituteId: branch.instituteId,
    startDate: start,
    endDate: end,
    isActive,
  });

  const populatedSection = await getPopulatedSection(section._id);

  res.status(201).json({
    success: true,
    message: 'Section created successfully',
    data: { section: formatSection(populatedSection) },
  });
});

const getSections = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branchId = getBranchIdFromQuery(req.query);
  const requestedInstituteId = getInstituteIdFromQuery(req.query);

  const filter = buildInstituteFilter(ownedInstituteIds, requestedInstituteId);

  if (branchId) {
    filter.branchId = branchId;
  }

  const sections = await Section.find(filter)
    .populate('courseId', 'name category')
    .populate('branchId', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      sections: sections.map(formatSection),
      count: sections.length,
    },
  });
});

const getSectionById = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const section = await getPopulatedSection(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, section.instituteId);

  res.status(200).json({
    success: true,
    data: { section: formatSection(section) },
  });
});

const updateSection = asyncHandler(async (req, res) => {
  const {
    name,
    courseId,
    branchId,
    startDate,
    endDate,
    isActive,
  } = req.body;

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const section = await Section.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, section.instituteId);

  const nextCourseId = courseId ?? section.courseId;
  const nextBranchId = branchId ?? section.branchId;
  const nextStartDate = startDate ?? section.startDate;
  const nextEndDate = endDate ?? section.endDate;

  await validateCourseAndBranch(nextCourseId, nextBranchId);
  const { start, end } = validateDates(nextStartDate, nextEndDate);

  const nextBranch = await Branch.findById(nextBranchId).select('instituteId');

  ensureInstituteAccess(ownedInstituteIds, nextBranch.instituteId);

  section.name = name ?? section.name;
  section.courseId = nextCourseId;
  section.branchId = nextBranchId;
  section.instituteId = nextBranch.instituteId;
  section.startDate = start;
  section.endDate = end;

  if (typeof isActive === 'boolean') {
    section.isActive = isActive;
  }

  await section.save();

  const populatedSection = await getPopulatedSection(section._id);

  res.status(200).json({
    success: true,
    message: 'Section updated successfully',
    data: { section: formatSection(populatedSection) },
  });
});

const deleteSection = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const section = await Section.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, section.instituteId);

  await section.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Section deleted successfully',
  });
});

const activateSection = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const section = await Section.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, section.instituteId);

  section.isActive = true;
  await section.save();

  const populatedSection = await getPopulatedSection(section._id);

  res.status(200).json({
    success: true,
    message: 'Section activated successfully',
    data: { section: formatSection(populatedSection) },
  });
});

const deactivateSection = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const section = await Section.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, section.instituteId);

  section.isActive = false;
  await section.save();

  const populatedSection = await getPopulatedSection(section._id);

  res.status(200).json({
    success: true,
    message: 'Section deactivated successfully',
    data: { section: formatSection(populatedSection) },
  });
});

module.exports = {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
  activateSection,
  deactivateSection,
};
