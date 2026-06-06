const Branch = require('../models/Branch');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatBranch = (branch) => ({
  id: branch._id,
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

const findDuplicateBranch = async ({ name, code, excludeId }) => {
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

  const query = { $or: filters };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Branch.findOne(query);
};

const createBranch = asyncHandler(async (req, res) => {
  const { name, code, address, city, state, status = 'active' } = req.body;

  const existingBranch = await findDuplicateBranch({ name, code });

  if (existingBranch) {
    if (existingBranch.name.toLowerCase() === name.toLowerCase()) {
      throw new AppError('A branch with this name already exists', 409);
    }

    throw new AppError('A branch with this code already exists', 409);
  }

  const branch = await Branch.create({
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

const getBranches = asyncHandler(async (_req, res) => {
  const branches = await Branch.find().sort({ createdAt: -1 });

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
      name: nameChanged ? name : undefined,
      code: codeChanged ? code : undefined,
      excludeId: branch._id,
    });

    if (existingBranch) {
      if (nameChanged && existingBranch.name.toLowerCase() === name.toLowerCase()) {
        throw new AppError('A branch with this name already exists', 409);
      }

      throw new AppError('A branch with this code already exists', 409);
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
