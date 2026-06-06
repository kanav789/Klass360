const Admin = require('../models/Admin');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please sign in.', 401);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new AppError('Invalid or expired session. Please sign in again.', 401);
  }

  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    throw new AppError('Admin account no longer exists.', 401);
  }

  if (!admin.isActive) {
    throw new AppError('Your account has been deactivated.', 403);
  }

  if (admin.role !== 'admin') {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  req.admin = admin;
  next();
});

module.exports = { authenticate };
