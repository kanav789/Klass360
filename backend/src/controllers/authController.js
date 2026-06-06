const Admin = require('../models/Admin');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');

const buildAuthResponse = (admin, token) => ({
  success: true,
  message: 'Authentication successful',
  data: {
    token,
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    },
  },
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new AppError('An account with this email already exists', 409);
  }

  const admin = await Admin.create({
    fullName,
    email,
    password,
    role: 'admin',
  });

  const token = signToken(admin._id);

  res.status(201).json({
    success: true,
    message: 'Admin account created successfully',
    data: {
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!admin.isActive) {
    throw new AppError('Your account has been deactivated', 403);
  }

  const isPasswordValid = await admin.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = signToken(admin._id);

  res.status(200).json(buildAuthResponse(admin, token));
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      admin: {
        id: req.admin._id,
        fullName: req.admin.fullName,
        email: req.admin.email,
        role: req.admin.role,
        lastLoginAt: req.admin.lastLoginAt,
        createdAt: req.admin.createdAt,
      },
    },
  });
});

const logout = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = { register, login, getMe, logout };
