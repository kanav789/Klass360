const Admin = require('../models/Admin');
const Institute = require('../models/Institute');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatAdmin = (admin, instituteCount = null) => ({
  id: admin._id,
  fullName: admin.fullName,
  email: admin.email,
  role: admin.role,
  isActive: admin.isActive,
  lastLoginAt: admin.lastLoginAt,
  createdAt: admin.createdAt,
  ...(instituteCount !== null ? { instituteCount } : {}),
});

const getAdmins = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;

  const filter = {};

  if (typeof search === 'string' && search.trim()) {
    const regex = new RegExp(`^${escapeRegex(search.trim())}`, 'i');
    filter.$or = [{ fullName: regex }, { email: regex }];
  }

  if (isActive === 'true' || isActive === 'false') {
    filter.isActive = isActive === 'true';
  }

  const admins = await Admin.find(filter).sort({ createdAt: -1 });

  const counts = await Institute.aggregate([
    { $match: { createdBy: { $in: admins.map((admin) => admin._id) } } },
    { $group: { _id: '$createdBy', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    counts.map((entry) => [String(entry._id), entry.count]),
  );

  res.status(200).json({
    success: true,
    data: {
      admins: admins.map((admin) =>
        formatAdmin(admin, countMap.get(String(admin._id)) || 0),
      ),
      count: admins.length,
    },
  });
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  if (typeof isActive === 'boolean') {
    if (String(admin._id) === String(req.admin._id)) {
      throw new AppError('You cannot change the status of your own account', 400);
    }

    admin.isActive = isActive;
  }

  await admin.save();

  res.status(200).json({
    success: true,
    message: 'Admin updated successfully',
    data: { admin: formatAdmin(admin) },
  });
});

module.exports = { getAdmins, updateAdmin };
