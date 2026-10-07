const Branch = require('../models/Branch');
const Course = require('../models/Course');
const Lead = require('../models/Lead');
const User = require('../models/User');
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

const formatBranchRef = (branch) => ({
  id: branch._id,
  name: branch.name,
  code: branch.code,
});

const formatCourseRef = (course) => ({
  id: course._id,
  name: course.name,
  category: course.category,
});

const formatUserRef = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
});

const formatLead = (lead) => ({
  id: lead._id,
  name: lead.name,
  number: lead.number,
  whatsappNumber: lead.whatsappNumber,
  alternateNumber: lead.alternateNumber || '',
  branchId: lead.branchId?._id || lead.branchId,
  courseId: lead.courseId?._id || lead.courseId,
  assignedTo: lead.assignedTo?._id || lead.assignedTo,
  instituteId: lead.instituteId,
  branch:
    lead.branchId && typeof lead.branchId === 'object'
      ? formatBranchRef(lead.branchId)
      : null,
  course:
    lead.courseId && typeof lead.courseId === 'object'
      ? formatCourseRef(lead.courseId)
      : null,
  assignedUser:
    lead.assignedTo && typeof lead.assignedTo === 'object'
      ? formatUserRef(lead.assignedTo)
      : null,
  source: lead.source,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

const validateLeadRelations = async ({ branchId, courseId, assignedTo }) => {
  const [branch, course, user] = await Promise.all([
    Branch.findById(branchId),
    Course.findById(courseId),
    User.findById(assignedTo),
  ]);

  if (!branch) {
    throw new AppError('Selected branch does not exist', 400);
  }

  if (!course) {
    throw new AppError('Selected course does not exist', 400);
  }

  if (!user) {
    throw new AppError('Selected assigned user does not exist', 400);
  }

  const isBranchLinkedToCourse = course.branchIds.some(
    (id) => id.toString() === branchId.toString(),
  );

  if (!isBranchLinkedToCourse) {
    throw new AppError('Selected course is not available for this branch', 400);
  }

  if (String(course.instituteId) !== String(branch.instituteId)) {
    throw new AppError('Selected course is not available for this branch', 400);
  }

  if (String(user.instituteId) !== String(branch.instituteId)) {
    throw new AppError(
      'Selected assigned user does not belong to this institute',
      400,
    );
  }

  return { branch, course, user };
};

const getPopulatedLead = (id) =>
  Lead.findById(id)
    .populate('branchId', 'name code')
    .populate('courseId', 'name category')
    .populate('assignedTo', 'firstName lastName email role');

const createLead = asyncHandler(async (req, res) => {
  const {
    name,
    number,
    whatsappNumber,
    alternateNumber = '',
    branchId,
    courseId,
    source,
    assignedTo,
  } = req.body;

  const { branch } = await validateLeadRelations({
    branchId,
    courseId,
    assignedTo,
  });

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  ensureInstituteAccess(ownedInstituteIds, branch.instituteId);

  const existingLead = await Lead.findOne({
    instituteId: branch.instituteId,
    number,
  });

  if (existingLead) {
    throw new AppError('A lead with this phone number already exists', 409);
  }

  const lead = await Lead.create({
    name,
    number,
    whatsappNumber,
    alternateNumber,
    branchId,
    courseId,
    source,
    assignedTo,
    instituteId: branch.instituteId,
  });

  const populatedLead = await getPopulatedLead(lead._id);

  res.status(201).json({
    success: true,
    message: 'Lead created successfully',
    data: { lead: formatLead(populatedLead) },
  });
});

const getLeads = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branchId = getBranchIdFromQuery(req.query);
  const requestedInstituteId = getInstituteIdFromQuery(req.query);

  const filter = buildInstituteFilter(ownedInstituteIds, requestedInstituteId);

  if (branchId) {
    filter.branchId = branchId;
  }

  const leads = await Lead.find(filter)
    .populate('branchId', 'name code')
    .populate('courseId', 'name category')
    .populate('assignedTo', 'firstName lastName email role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      leads: leads.map(formatLead),
      count: leads.length,
    },
  });
});

const getLeadById = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const lead = await getPopulatedLead(req.params.id);

  if (!lead) {
    throw new AppError('Lead not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, lead.instituteId);

  res.status(200).json({
    success: true,
    data: { lead: formatLead(lead) },
  });
});

const updateLead = asyncHandler(async (req, res) => {
  if (req.body.number !== undefined) {
    throw new AppError('Phone number cannot be updated', 400);
  }

  const {
    name,
    whatsappNumber,
    alternateNumber,
    branchId,
    courseId,
    source,
    assignedTo,
  } = req.body;

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    throw new AppError('Lead not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, lead.instituteId);

  const nextBranchId = branchId ?? lead.branchId;
  const { branch } = await validateLeadRelations({
    branchId: nextBranchId,
    courseId: courseId ?? lead.courseId,
    assignedTo: assignedTo ?? lead.assignedTo,
  });

  lead.name = name ?? lead.name;
  lead.whatsappNumber = whatsappNumber ?? lead.whatsappNumber;
  lead.alternateNumber = alternateNumber ?? lead.alternateNumber;
  lead.branchId = nextBranchId;
  lead.instituteId = branch.instituteId;
  lead.courseId = courseId ?? lead.courseId;
  lead.source = source ?? lead.source;
  lead.assignedTo = assignedTo ?? lead.assignedTo;
  await lead.save();

  const populatedLead = await getPopulatedLead(lead._id);

  res.status(200).json({
    success: true,
    message: 'Lead updated successfully',
    data: { lead: formatLead(populatedLead) },
  });
});

const deleteLead = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    throw new AppError('Lead not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, lead.instituteId);

  await lead.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Lead deleted successfully',
  });
});

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
};
