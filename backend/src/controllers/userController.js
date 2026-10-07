const Branch = require('../models/Branch');
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

const formatUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  mobile: user.mobile,
  email: user.email,
  role: user.role,
  branchId: user.branchId?._id || user.branchId,
  instituteId: user.instituteId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const validateBranch = async (branchId) => {
  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw new AppError('Selected branch does not exist', 400);
  }

  return branch;
};

const findDuplicateUser = async ({ instituteId, email, mobile, excludeId }) => {
  const filters = [];

  if (email) {
    filters.push({ email: email.toLowerCase() });
  }

  if (mobile) {
    filters.push({ mobile });
  }

  if (filters.length === 0) {
    return null;
  }

  const query = { instituteId, $or: filters };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return User.findOne(query);
};

const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, mobile, email, role, branchId } = req.body;

  const branch = await validateBranch(branchId);

  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  ensureInstituteAccess(ownedInstituteIds, branch.instituteId);

  const existingUser = await findDuplicateUser({
    instituteId: branch.instituteId,
    email,
    mobile,
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new AppError('A user with this email already exists', 409);
    }

    throw new AppError('A user with this mobile number already exists', 409);
  }

  const user = await User.create({
    firstName,
    lastName,
    mobile,
    email,
    role,
    branchId,
    instituteId: branch.instituteId,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: formatUser(user) },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const branchId = getBranchIdFromQuery(req.query);
  const requestedInstituteId = getInstituteIdFromQuery(req.query);

  const filter = buildInstituteFilter(ownedInstituteIds, requestedInstituteId);

  if (branchId) {
    filter.branchId = branchId;
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      users: users.map(formatUser),
      count: users.length,
    },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, user.instituteId);

  res.status(200).json({
    success: true,
    data: { user: formatUser(user) },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, mobile, email, role, branchId } = req.body;
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, user.instituteId);

  const nextBranchId = branchId ?? user.branchId;
  const nextBranch = await validateBranch(nextBranchId);
  ensureInstituteAccess(ownedInstituteIds, nextBranch.instituteId);

  const emailChanged = email && email.toLowerCase() !== user.email;
  const mobileChanged = mobile && mobile !== user.mobile;

  if (emailChanged || mobileChanged) {
    const existingUser = await findDuplicateUser({
      instituteId: nextBranch.instituteId,
      email: emailChanged ? email : undefined,
      mobile: mobileChanged ? mobile : undefined,
      excludeId: user._id,
    });

    if (existingUser) {
      if (emailChanged && existingUser.email === email.toLowerCase()) {
        throw new AppError('A user with this email already exists', 409);
      }

      throw new AppError('A user with this mobile number already exists', 409);
    }
  }

  user.firstName = firstName ?? user.firstName;
  user.lastName = lastName ?? user.lastName;
  user.mobile = mobile ?? user.mobile;
  user.email = email ?? user.email;
  user.role = role ?? user.role;
  user.branchId = nextBranchId;
  user.instituteId = nextBranch.instituteId;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user: formatUser(user) },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, user.instituteId);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
