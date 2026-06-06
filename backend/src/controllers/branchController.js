const Branch = require('../models/Branch');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatBranch = (branch) => ({
  id: branch._id,
  name: branch.name,
  address: branch.address,
  createdBy: branch.createdBy,
  createdAt: branch.createdAt,
  updatedAt: branch.updatedAt,
});

const createBranch = asyncHandler(async (req, res) => {
  const { name, address } = req.body;

  const existingBranch = await Branch.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
  });

  if (existingBranch) {
    throw new AppError('A branch with this name already exists', 409);
  }

  const branch = await Branch.create({
    name,
    address,
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
  const { name, address } = req.body;

  const branch = await Branch.findById(req.params.id);

  if (!branch) {
    throw new AppError('Branch not found', 404);
  }

  if (name && name.toLowerCase() !== branch.name.toLowerCase()) {
    const existingBranch = await Branch.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
      _id: { $ne: branch._id },
    });

    if (existingBranch) {
      throw new AppError('A branch with this name already exists', 409);
    }
  }

  branch.name = name ?? branch.name;
  branch.address = address ?? branch.address;
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
