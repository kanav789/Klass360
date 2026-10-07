const Admission = require('../models/Admission');
const Branch = require('../models/Branch');
const Course = require('../models/Course');
const Enquiry = require('../models/Enquiry');
const Lead = require('../models/Lead');
const Section = require('../models/Section');
const Student = require('../models/Student');
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

const formatLeadRef = (lead) => ({
  id: lead._id,
  name: lead.name,
  number: lead.number,
  whatsappNumber: lead.whatsappNumber,
});

const formatSectionRef = (section) => ({
  id: section._id,
  name: section.name,
  startDate: section.startDate,
  endDate: section.endDate,
});

const formatStudentRef = (student) => ({
  id: student._id,
  fullName: student.fullName,
  mobile: student.mobile,
  email: student.email || '',
  qualification: student.qualification || '',
  isActive: student.isActive,
});

const formatAdmission = (admission) => ({
  id: admission._id,
  enquiryId: admission.enquiryId?._id || admission.enquiryId,
  leadId: admission.leadId?._id || admission.leadId,
  courseId: admission.courseId?._id || admission.courseId,
  branchId: admission.branchId?._id || admission.branchId,
  batchId: admission.batchId?._id || admission.batchId,
  studentId: admission.studentId?._id || admission.studentId,
  instituteId: admission.instituteId,
  lead:
    admission.leadId && typeof admission.leadId === 'object'
      ? formatLeadRef(admission.leadId)
      : null,
  course:
    admission.courseId && typeof admission.courseId === 'object'
      ? formatCourseRef(admission.courseId)
      : null,
  branch:
    admission.branchId && typeof admission.branchId === 'object'
      ? formatBranchRef(admission.branchId)
      : null,
  batch:
    admission.batchId && typeof admission.batchId === 'object'
      ? formatSectionRef(admission.batchId)
      : null,
  student:
    admission.studentId && typeof admission.studentId === 'object'
      ? formatStudentRef(admission.studentId)
      : null,
  admissionDate: admission.admissionDate,
  totalFee: admission.totalFee,
  discount: admission.discount ?? 0,
  netFee: admission.netFee,
  status: admission.status,
  createdAt: admission.createdAt,
  updatedAt: admission.updatedAt,
});

const validateAdmissionRelations = async ({
  enquiryId,
  leadId,
  branchId,
  courseId,
  batchId,
}) => {
  const [enquiry, lead, branch, course, batch] = await Promise.all([
    Enquiry.findById(enquiryId),
    Lead.findById(leadId),
    Branch.findById(branchId),
    Course.findById(courseId),
    Section.findById(batchId),
  ]);

  if (!enquiry) {
    throw new AppError('Selected enquiry does not exist', 400);
  }

  if (!lead) {
    throw new AppError('Selected lead does not exist', 400);
  }

  if (!branch) {
    throw new AppError('Selected branch does not exist', 400);
  }

  if (!course) {
    throw new AppError('Selected course does not exist', 400);
  }

  if (!batch) {
    throw new AppError('Selected batch does not exist', 400);
  }

  if (enquiry.leadId.toString() !== leadId.toString()) {
    throw new AppError('Lead does not match the selected enquiry', 400);
  }

  if (enquiry.courseId.toString() !== courseId.toString()) {
    throw new AppError('Course does not match the selected enquiry', 400);
  }

  if (enquiry.branchId.toString() !== branchId.toString()) {
    throw new AppError('Branch does not match the selected enquiry', 400);
  }

  const isBranchLinkedToCourse = course.branchIds.some(
    (id) => id.toString() === branchId.toString(),
  );

  if (!isBranchLinkedToCourse) {
    throw new AppError('Selected course is not available for this branch', 400);
  }

  if (batch.courseId.toString() !== courseId.toString()) {
    throw new AppError('Selected batch does not belong to this course', 400);
  }

  if (batch.branchId.toString() !== branchId.toString()) {
    throw new AppError('Selected batch does not belong to this branch', 400);
  }

  if (String(enquiry.instituteId) !== String(branch.instituteId)) {
    throw new AppError('Selected enquiry does not belong to this branch', 400);
  }

  if (String(course.instituteId) !== String(branch.instituteId)) {
    throw new AppError('Selected course is not available for this branch', 400);
  }

  if (String(batch.instituteId) !== String(branch.instituteId)) {
    throw new AppError('Selected batch does not belong to this branch', 400);
  }

  return { enquiry, lead, branch, course, batch };
};

const getPopulatedAdmission = (id) =>
  Admission.findById(id)
    .populate('enquiryId', 'enquiryDate status')
    .populate('leadId', 'name number whatsappNumber')
    .populate('courseId', 'name category')
    .populate('branchId', 'name code')
    .populate('batchId', 'name startDate endDate')
    .populate('studentId', 'fullName mobile email qualification isActive');

const syncStudentFromAdmission = async (admission, lead, options = {}) => {
  const { email = '', qualification = '' } = options;

  if (!admission.studentId) {
    return null;
  }

  const student = await Student.findById(admission.studentId);

  if (!student) {
    return null;
  }

  student.leadId = admission.leadId;
  student.fullName = lead.name;
  student.mobile = lead.number;
  student.whatsappNumber = lead.whatsappNumber;
  student.alternateMobile = lead.alternateNumber || '';
  student.branchId = admission.branchId;
  student.instituteId = admission.instituteId;

  if (email) {
    student.email = email;
  }

  if (qualification) {
    student.qualification = qualification;
  }

  student.isActive = admission.status !== 'cancelled';

  await student.save();

  return student;
};

const createAdmission = asyncHandler(async (req, res) => {
  const {
    enquiryId,
    leadId,
    courseId,
    branchId,
    batchId,
    admissionDate,
    totalFee,
    discount = 0,
    status = 'pending',
    email = '',
    qualification = '',
  } = req.body;

  if (discount > totalFee) {
    throw new AppError('Discount cannot exceed total fee', 400);
  }

  const existingAdmission = await Admission.findOne({ enquiryId });

  if (existingAdmission) {
    throw new AppError('An admission already exists for this enquiry', 400);
  }

  const { lead, branch } = await validateAdmissionRelations({
    enquiryId,
    leadId,
    branchId,
    courseId,
    batchId,
  });

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  ensureInstituteAccess(ownedInstituteIds, branch.instituteId);

  let admission;

  try {
    admission = await Admission.create({
      enquiryId,
      leadId,
      courseId,
      branchId,
      batchId,
      instituteId: branch.instituteId,
      admissionDate: new Date(admissionDate),
      totalFee,
      discount,
      status,
    });

    try {
      const student = await Student.create({
        leadId,
        admissionId: admission._id,
        fullName: lead.name,
        mobile: lead.number,
        whatsappNumber: lead.whatsappNumber,
        email,
        alternateMobile: lead.alternateNumber || '',
        qualification,
        branchId,
        instituteId: branch.instituteId,
        isActive: status !== 'cancelled',
      });

      admission.studentId = student._id;
      await admission.save();
    } catch (studentError) {
      await Admission.findByIdAndDelete(admission._id);
      throw studentError;
    }

    const populatedAdmission = await getPopulatedAdmission(admission._id);

    res.status(201).json({
      success: true,
      message: 'Admission created successfully and student profile generated',
      data: { admission: formatAdmission(populatedAdmission) },
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('An admission already exists for this enquiry', 400);
    }

    throw error;
  }
});

const getAdmissions = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branchId = getBranchIdFromQuery(req.query);
  const requestedInstituteId = getInstituteIdFromQuery(req.query);

  const filter = buildInstituteFilter(ownedInstituteIds, requestedInstituteId);

  if (branchId) {
    filter.branchId = branchId;
  }

  const admissions = await Admission.find(filter)
    .populate('leadId', 'name number whatsappNumber')
    .populate('courseId', 'name category')
    .populate('branchId', 'name code')
    .populate('batchId', 'name startDate endDate')
    .populate('studentId', 'fullName mobile email qualification isActive')
    .sort({ admissionDate: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      admissions: admissions.map(formatAdmission),
      count: admissions.length,
    },
  });
});

const getAdmissionById = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const admission = await getPopulatedAdmission(req.params.id);

  if (!admission) {
    throw new AppError('Admission not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, admission.instituteId);

  res.status(200).json({
    success: true,
    data: { admission: formatAdmission(admission) },
  });
});

const updateAdmission = asyncHandler(async (req, res) => {
  const {
    enquiryId,
    leadId,
    courseId,
    branchId,
    batchId,
    admissionDate,
    totalFee,
    discount,
    status,
    email,
    qualification,
  } = req.body;

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const admission = await Admission.findById(req.params.id);

  if (!admission) {
    throw new AppError('Admission not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, admission.instituteId);

  const nextTotalFee = totalFee ?? admission.totalFee;
  const nextDiscount = discount ?? admission.discount ?? 0;

  if (nextDiscount > nextTotalFee) {
    throw new AppError('Discount cannot exceed total fee', 400);
  }

  if (enquiryId && enquiryId !== admission.enquiryId.toString()) {
    const existingAdmission = await Admission.findOne({ enquiryId });

    if (existingAdmission) {
      throw new AppError('An admission already exists for this enquiry', 400);
    }
  }

  const { lead, branch } = await validateAdmissionRelations({
    enquiryId: enquiryId ?? admission.enquiryId,
    leadId: leadId ?? admission.leadId,
    branchId: branchId ?? admission.branchId,
    courseId: courseId ?? admission.courseId,
    batchId: batchId ?? admission.batchId,
  });

  admission.enquiryId = enquiryId ?? admission.enquiryId;
  admission.leadId = leadId ?? admission.leadId;
  admission.courseId = courseId ?? admission.courseId;
  admission.branchId = branchId ?? admission.branchId;
  admission.batchId = batchId ?? admission.batchId;
  admission.instituteId = branch.instituteId;
  admission.admissionDate = admissionDate
    ? new Date(admissionDate)
    : admission.admissionDate;
  admission.totalFee = nextTotalFee;
  admission.discount = nextDiscount;
  admission.status = status ?? admission.status;

  await admission.save();
  await syncStudentFromAdmission(admission, lead, { email, qualification });

  const populatedAdmission = await getPopulatedAdmission(admission._id);

  res.status(200).json({
    success: true,
    message: 'Admission updated successfully',
    data: { admission: formatAdmission(populatedAdmission) },
  });
});

const deleteAdmission = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const admission = await Admission.findById(req.params.id);

  if (!admission) {
    throw new AppError('Admission not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, admission.instituteId);

  if (admission.studentId) {
    await Student.findByIdAndDelete(admission.studentId);
  }

  await Admission.findByIdAndDelete(admission._id);

  res.status(200).json({
    success: true,
    message: 'Admission and linked student deleted successfully',
  });
});

module.exports = {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
};
