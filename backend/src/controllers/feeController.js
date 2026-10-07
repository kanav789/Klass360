const Admission = require('../models/Admission');
const {
  getBranchIdFromQuery,
  getInstituteIdFromQuery,
} = require('../utils/queryFilters');
const {
  getOwnedInstituteIds,
  buildInstituteFilter,
  ensureInstituteAccess,
} = require('../utils/tenancy');
const Fee = require('../models/Fee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const formatLeadRef = (lead) => ({
  id: lead._id,
  name: lead.name,
  number: lead.number,
});

const formatStudentRef = (student) => ({
  id: student._id,
  fullName: student.fullName,
  mobile: student.mobile,
});

const formatAdmissionRef = (admission) => ({
  id: admission._id,
  admissionDate: admission.admissionDate,
  totalFee: admission.totalFee,
  discount: admission.discount ?? 0,
  netFee: admission.netFee,
  status: admission.status,
  lead:
    admission.leadId && typeof admission.leadId === 'object'
      ? formatLeadRef(admission.leadId)
      : null,
  student:
    admission.studentId && typeof admission.studentId === 'object'
      ? formatStudentRef(admission.studentId)
      : null,
  course:
    admission.courseId && typeof admission.courseId === 'object'
      ? {
          id: admission.courseId._id,
          name: admission.courseId.name,
        }
      : null,
  branch:
    admission.branchId && typeof admission.branchId === 'object'
      ? {
          id: admission.branchId._id,
          name: admission.branchId.name,
        }
      : null,
});

const formatFee = (fee) => ({
  id: fee._id,
  admissionId: fee.admissionId?._id || fee.admissionId,
  instituteId: fee.instituteId,
  discount: fee.discount ?? 0,
  netFee: fee.netFee,
  paidAmount: fee.paidAmount,
  pendingAmount: fee.pendingAmount,
  status: fee.status,
  admission:
    fee.admissionId && typeof fee.admissionId === 'object'
      ? formatAdmissionRef(fee.admissionId)
      : null,
  createdAt: fee.createdAt,
  updatedAt: fee.updatedAt,
});

const getAdmissionFeeDetails = async (admissionId) => {
  const admission = await Admission.findById(admissionId);

  if (!admission) {
    throw new AppError('Selected admission does not exist', 400);
  }

  return {
    discount: admission.discount ?? 0,
    netFee: admission.netFee,
  };
};

const getPopulatedFee = (id) =>
  Fee.findById(id).populate({
    path: 'admissionId',
    select: 'admissionDate totalFee discount netFee status',
    populate: [
      { path: 'leadId', select: 'name number' },
      { path: 'studentId', select: 'fullName mobile' },
      { path: 'courseId', select: 'name' },
      { path: 'branchId', select: 'name' },
    ],
  });

const createFee = asyncHandler(async (req, res) => {
  const { admissionId, paidAmount } = req.body;

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const admission = await Admission.findById(admissionId);

  if (!admission) {
    throw new AppError('Selected admission does not exist', 400);
  }

  ensureInstituteAccess(ownedInstituteIds, admission.instituteId);

  const existingFee = await Fee.findOne({ admissionId });

  if (existingFee) {
    throw new AppError('A fee record already exists for this admission', 400);
  }

  const { discount, netFee } = await getAdmissionFeeDetails(admissionId);

  if (paidAmount > netFee) {
    throw new AppError('Paid amount cannot exceed net fee', 400);
  }

  const fee = await Fee.create({
    admissionId,
    instituteId: admission.instituteId,
    discount,
    netFee,
    paidAmount,
  });

  const populatedFee = await getPopulatedFee(fee._id);

  res.status(201).json({
    success: true,
    message: 'Fee record created successfully',
    data: { fee: formatFee(populatedFee) },
  });
});

const getFees = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branchId = getBranchIdFromQuery(req.query);
  const requestedInstituteId = getInstituteIdFromQuery(req.query);

  const filter = buildInstituteFilter(ownedInstituteIds, requestedInstituteId);

  if (branchId) {
    const admissions = await Admission.find({ branchId }).select('_id');
    filter.admissionId = { $in: admissions.map((admission) => admission._id) };
  }

  const fees = await Fee.find(filter)
    .populate({
      path: 'admissionId',
      select: 'admissionDate totalFee discount netFee status',
      populate: [
        { path: 'leadId', select: 'name number' },
        { path: 'studentId', select: 'fullName mobile' },
        { path: 'courseId', select: 'name' },
        { path: 'branchId', select: 'name' },
      ],
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      fees: fees.map(formatFee),
      count: fees.length,
    },
  });
});

const getFeeById = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const fee = await getPopulatedFee(req.params.id);

  if (!fee) {
    throw new AppError('Fee record not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, fee.instituteId);

  res.status(200).json({
    success: true,
    data: { fee: formatFee(fee) },
  });
});

const updateFee = asyncHandler(async (req, res) => {
  const { admissionId, paidAmount } = req.body;
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);

  const fee = await Fee.findById(req.params.id);

  if (!fee) {
    throw new AppError('Fee record not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, fee.instituteId);

  const nextAdmissionId = admissionId ?? fee.admissionId;
  const nextAdmission = await Admission.findById(nextAdmissionId);

  if (!nextAdmission) {
    throw new AppError('Selected admission does not exist', 400);
  }

  ensureInstituteAccess(ownedInstituteIds, nextAdmission.instituteId);

  if (admissionId && admissionId !== fee.admissionId.toString()) {
    const existingFee = await Fee.findOne({ admissionId });

    if (existingFee) {
      throw new AppError('A fee record already exists for this admission', 400);
    }
  }

  const { discount, netFee } = await getAdmissionFeeDetails(nextAdmissionId);
  const nextPaidAmount = paidAmount ?? fee.paidAmount;

  if (nextPaidAmount > netFee) {
    throw new AppError('Paid amount cannot exceed net fee', 400);
  }

  fee.admissionId = nextAdmissionId;
  fee.instituteId = nextAdmission.instituteId;
  fee.discount = discount;
  fee.netFee = netFee;
  fee.paidAmount = nextPaidAmount;
  await fee.save();

  const populatedFee = await getPopulatedFee(fee._id);

  res.status(200).json({
    success: true,
    message: 'Fee record updated successfully',
    data: { fee: formatFee(populatedFee) },
  });
});

const deleteFee = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const fee = await Fee.findById(req.params.id);

  if (!fee) {
    throw new AppError('Fee record not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, fee.instituteId);

  await fee.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Fee record deleted successfully',
  });
});

module.exports = {
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
};
