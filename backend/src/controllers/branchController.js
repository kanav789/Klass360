const Branch = require('../models/Branch');
const Institute = require('../models/Institute');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  getBranchIdFromQuery,
  getInstituteIdFromQuery,
} = require('../utils/queryFilters');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatBranch = (branch) => ({
  id: branch._id,
  instituteId: branch.instituteId?._id || branch.instituteId,
  name: branch.name,
  code: branch.code,
  address: branch.address,
  city: branch.city,
  state: branch.state,
  status: branch.status,
  createdBy: branch.createdBy,
  createdAt: branch.createdAt,
  updatedAt: branch.updatedAt,
});

const resolveInstituteId = async (instituteId) => {
  if (instituteId) {
    const institute = await Institute.findById(instituteId);

    if (!institute) {
      throw new AppError('Selected institute does not exist', 400);
    }

    return institute._id;
  }

  const institute =
    (await Institute.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
    (await Institute.findOne().sort({ createdAt: -1 }));

  if (!institute) {
    throw new AppError(
      'Create an institute in Settings before adding branches',
      400,
    );
  }

  return institute._id;
};

const findDuplicateBranch = async ({ instituteId, name, code, excludeId }) => {
  const filters = [];

  if (name) {
    filters.push({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    });
  }

  if (code) {
    filters.push({
      code: { $regex: new RegExp(`^${escapeRegex(code)}$`, 'i') },
    });
  }

  if (filters.length === 0) {
    return null;
  }

  const query = {
    instituteId,
    $or: filters,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Branch.findOne(query);
};

const createBranch = asyncHandler(async (req, res) => {
  const { name, code, address, city, state, status = 'active', instituteId } =
    req.body;

  const resolvedInstituteId = await resolveInstituteId(instituteId);

  const existingBranch = await findDuplicateBranch({
    instituteId: resolvedInstituteId,
    name,
    code,
  });

  if (existingBranch) {
    if (existingBranch.name.toLowerCase() === name.toLowerCase()) {
      throw new AppError('A branch with this name already exists for the institute', 409);
    }

    throw new AppError('A branch with this code already exists for the institute', 409);
  }

  const branch = await Branch.create({
    instituteId: resolvedInstituteId,
    name,
    code: code.toUpperCase(),
    address,
    city,
    state,
    status,
    createdBy: req.admin._id,
  });

  res.status(201).json({
    success: true,
    message: 'Branch created successfully',
    data: { branch: formatBranch(branch) },
  });
});

const getBranches = asyncHandler(async (req, res) => {
  const instituteId = getInstituteIdFromQuery(req.query);
  const branchId = getBranchIdFromQuery(req.query);

  const filter = {};

  if (instituteId) {
    filter.instituteId = instituteId;
  }

  if (branchId) {
    filter._id = branchId;
  }

  const branches = await Branch.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      branches: branches.map(formatBranch),
      count: branches.length,
    },
  });
});

const getBranchById = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);

  if (!branch) {
    throw new AppError('Branch not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { branch: formatBranch(branch) },
  });
});

const updateBranch = asyncHandler(async (req, res) => {
  const { name, code, address, city, state, status } = req.body;

  const branch = await Branch.findById(req.params.id);

  if (!branch) {
    throw new AppError('Branch not found', 404);
  }

  const nameChanged = name && name.toLowerCase() !== branch.name.toLowerCase();
  const codeChanged =
    code && code.toUpperCase() !== branch.code.toUpperCase();

  if (nameChanged || codeChanged) {
    const existingBranch = await findDuplicateBranch({
      instituteId: branch.instituteId,
      name: nameChanged ? name : undefined,
      code: codeChanged ? code : undefined,
      excludeId: branch._id,
    });

    if (existingBranch) {
      if (nameChanged && existingBranch.name.toLowerCase() === name.toLowerCase()) {
        throw new AppError('A branch with this name already exists for the institute', 409);
      }

      throw new AppError('A branch with this code already exists for the institute', 409);
    }
  }

  branch.name = name ?? branch.name;
  branch.code = code ? code.toUpperCase() : branch.code;
  branch.address = address ?? branch.address;
  branch.city = city ?? branch.city;
  branch.state = state ?? branch.state;
  branch.status = status ?? branch.status;
  await branch.save();

  res.status(200).json({
    success: true,
    message: 'Branch updated successfully',
    data: { branch: formatBranch(branch) },
  });
});

const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findByIdAndDelete(req.params.id);

  if (!branch) {
    throw new AppError('Branch not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Branch deleted successfully',
  });
});

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};
