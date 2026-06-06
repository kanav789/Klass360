const Branch = require('../models/Branch');
const Course = require('../models/Course');
const Enquiry = require('../models/Enquiry');
const Lead = require('../models/Lead');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

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

const formatLeadRef = (lead) => ({
  id: lead._id,
  name: lead.name,
  number: lead.number,
  whatsappNumber: lead.whatsappNumber,
});

const formatEnquiry = (enquiry) => ({
  id: enquiry._id,
  leadId: enquiry.leadId?._id || enquiry.leadId,
  courseId: enquiry.courseId?._id || enquiry.courseId,
  branchId: enquiry.branchId?._id || enquiry.branchId,
  assignedTo: enquiry.assignedTo?._id || enquiry.assignedTo,
  lead:
    enquiry.leadId && typeof enquiry.leadId === 'object'
      ? formatLeadRef(enquiry.leadId)
      : null,
  course:
    enquiry.courseId && typeof enquiry.courseId === 'object'
      ? formatCourseRef(enquiry.courseId)
      : null,
  branch:
    enquiry.branchId && typeof enquiry.branchId === 'object'
      ? formatBranchRef(enquiry.branchId)
      : null,
  assignedUser:
    enquiry.assignedTo && typeof enquiry.assignedTo === 'object'
      ? formatUserRef(enquiry.assignedTo)
      : null,
  enquiryDate: enquiry.enquiryDate,
  status: enquiry.status,
  notes: enquiry.notes || '',
  createdAt: enquiry.createdAt,
  updatedAt: enquiry.updatedAt,
});

const validateEnquiryRelations = async ({
  leadId,
  branchId,
  courseId,
  assignedTo,
}) => {
  const [lead, branch, course, user] = await Promise.all([
    Lead.findById(leadId),
    Branch.findById(branchId),
    Course.findById(courseId),
    User.findById(assignedTo),
  ]);

  if (!lead) {
    throw new AppError('Selected lead does not exist', 400);
  }

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

  return { lead, branch, course, user };
};

const getPopulatedEnquiry = (id) =>
  Enquiry.findById(id)
    .populate('leadId', 'name number whatsappNumber')
    .populate('courseId', 'name category')
    .populate('branchId', 'name code')
    .populate('assignedTo', 'firstName lastName email role');

const createEnquiry = asyncHandler(async (req, res) => {
  const {
    leadId,
    courseId,
    branchId,
    assignedTo,
    enquiryDate,
    status = 'yet_to_decide',
    notes = '',
  } = req.body;

  await validateEnquiryRelations({ leadId, branchId, courseId, assignedTo });

  const enquiry = await Enquiry.create({
    leadId,
    courseId,
    branchId,
    assignedTo,
    enquiryDate: new Date(enquiryDate),
    status,
    notes,
  });

  const populatedEnquiry = await getPopulatedEnquiry(enquiry._id);

  res.status(201).json({
    success: true,
    message: 'Enquiry created successfully',
    data: { enquiry: formatEnquiry(populatedEnquiry) },
  });
});

const getEnquiries = asyncHandler(async (_req, res) => {
  const enquiries = await Enquiry.find()
    .populate('leadId', 'name number whatsappNumber')
    .populate('courseId', 'name category')
    .populate('branchId', 'name code')
    .populate('assignedTo', 'firstName lastName email role')
    .sort({ enquiryDate: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      enquiries: enquiries.map(formatEnquiry),
      count: enquiries.length,
    },
  });
});

const getEnquiryById = asyncHandler(async (req, res) => {
  const enquiry = await getPopulatedEnquiry(req.params.id);

  if (!enquiry) {
    throw new AppError('Enquiry not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { enquiry: formatEnquiry(enquiry) },
  });
});

const updateEnquiry = asyncHandler(async (req, res) => {
  const {
    leadId,
    courseId,
    branchId,
    assignedTo,
    enquiryDate,
    status,
    notes,
  } = req.body;

  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    throw new AppError('Enquiry not found', 404);
  }

  await validateEnquiryRelations({
    leadId: leadId ?? enquiry.leadId,
    branchId: branchId ?? enquiry.branchId,
    courseId: courseId ?? enquiry.courseId,
    assignedTo: assignedTo ?? enquiry.assignedTo,
  });

  enquiry.leadId = leadId ?? enquiry.leadId;
  enquiry.courseId = courseId ?? enquiry.courseId;
  enquiry.branchId = branchId ?? enquiry.branchId;
  enquiry.assignedTo = assignedTo ?? enquiry.assignedTo;
  enquiry.enquiryDate = enquiryDate
    ? new Date(enquiryDate)
    : enquiry.enquiryDate;
  enquiry.status = status ?? enquiry.status;
  enquiry.notes = notes ?? enquiry.notes;
  await enquiry.save();

  const populatedEnquiry = await getPopulatedEnquiry(enquiry._id);

  res.status(200).json({
    success: true,
    message: 'Enquiry updated successfully',
    data: { enquiry: formatEnquiry(populatedEnquiry) },
  });
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

  if (!enquiry) {
    throw new AppError('Enquiry not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Enquiry deleted successfully',
  });
});

module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
};
