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

const formatLeadRef = (lead) => ({
  id: lead._id,
  name: lead.name,
  number: lead.number,
});

const formatStudent = (student) => ({
  id: student._id,
  leadId: student.leadId?._id || student.leadId,
  admissionId: student.admissionId?._id || student.admissionId,
  fullName: student.fullName,
  mobile: student.mobile,
  whatsappNumber: student.whatsappNumber,
  email: student.email || '',
  alternateMobile: student.alternateMobile || '',
  qualification: student.qualification || '',
  branchId: student.branchId?._id || student.branchId,
  instituteId: student.instituteId,
  branch:
    student.branchId && typeof student.branchId === 'object'
      ? formatBranchRef(student.branchId)
      : null,
  lead:
    student.leadId && typeof student.leadId === 'object'
      ? formatLeadRef(student.leadId)
      : null,
  isActive: student.isActive,
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
});

const getPopulatedStudent = (id) =>
  Student.findById(id)
    .populate('branchId', 'name code')
    .populate('leadId', 'name number');

const getStudents = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branchId = getBranchIdFromQuery(req.query);
  const requestedInstituteId = getInstituteIdFromQuery(req.query);

  const filter = buildInstituteFilter(ownedInstituteIds, requestedInstituteId);

  if (branchId) {
    filter.branchId = branchId;
  }

  const students = await Student.find(filter)
    .populate('branchId', 'name code')
    .populate('leadId', 'name number')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      students: students.map(formatStudent),
      count: students.length,
    },
  });
});

const getStudentById = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const student = await getPopulatedStudent(req.params.id);

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, student.instituteId);

  res.status(200).json({
    success: true,
    data: { student: formatStudent(student) },
  });
});

module.exports = {
  getStudents,
  getStudentById,
};
