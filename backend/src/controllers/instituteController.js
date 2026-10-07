const mongoose = require('mongoose');
const Institute = require('../models/Institute');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { deleteLogoFile } = require('../middleware/uploadLogo');
const {
  getOwnedInstituteIds,
  ensureInstituteAccess,
} = require('../utils/tenancy');
const { getInstituteIdFromQuery } = require('../utils/queryFilters');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatInstitute = (institute) => ({
  id: institute._id,
  name: institute.name,
  email: institute.email,
  phone: institute.phone,
  address: institute.address,
  logo: institute.logo || '',
  isActive: institute.isActive,
  createdBy: institute.createdBy?._id || institute.createdBy,
  ownerName: institute.createdBy?.fullName || '',
  createdAt: institute.createdAt,
  updatedAt: institute.updatedAt,
});

const parseIsActive = (value, fallback = true) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return value === 'true';
};

const buildLogoPath = (file) => (file ? `/uploads/logos/${file.filename}` : '');

const findDuplicateInstitute = async ({ name, email, excludeId }) => {
  const filters = [];

  if (name) {
    filters.push({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    });
  }

  if (email) {
    filters.push({
      email: { $regex: new RegExp(`^${escapeRegex(email)}$`, 'i') },
    });
  }

  if (filters.length === 0) {
    return null;
  }

  const query = { $or: filters };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Institute.findOne(query);
};

const createInstitute = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;
  const isActive = parseIsActive(req.body.isActive, true);

  const existingInstitute = await findDuplicateInstitute({ name, email });

  if (existingInstitute) {
    if (existingInstitute.name.toLowerCase() === name.toLowerCase()) {
      if (req.file) {
        deleteLogoFile(buildLogoPath(req.file));
      }

      throw new AppError('An institute with this name already exists', 409);
    }

    if (req.file) {
      deleteLogoFile(buildLogoPath(req.file));
    }

    throw new AppError('An institute with this email already exists', 409);
  }

  const institute = await Institute.create({
    name,
    email,
    phone,
    address,
    logo: buildLogoPath(req.file),
    isActive,
    createdBy: req.admin._id,
  });

  res.status(201).json({
    success: true,
    message: 'Institute created successfully',
    data: { institute: formatInstitute(institute) },
  });
});

const getInstitutes = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const filter = {};

  if (ownedInstituteIds === null) {
    // Superadmin sees all institutes, optionally filtered to one owner.
    const { ownerId } = req.query;

    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
      filter.createdBy = ownerId;
    }
  } else {
    filter._id = { $in: ownedInstituteIds };
  }

  const institutes = await Institute.find(filter)
    .populate('createdBy', 'fullName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      institutes: institutes.map(formatInstitute),
      count: institutes.length,
    },
  });
});

const getActiveInstitute = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const requestedInstituteId = getInstituteIdFromQuery(req.query);

  let institute = null;

  if (ownedInstituteIds === null) {
    institute = requestedInstituteId
      ? await Institute.findById(requestedInstituteId)
      : (await Institute.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
        (await Institute.findOne().sort({ createdAt: -1 }));
  } else if (requestedInstituteId) {
    institute = ownedInstituteIds.some(
      (id) => String(id) === String(requestedInstituteId),
    )
      ? await Institute.findById(requestedInstituteId)
      : null;
  } else {
    institute =
      (await Institute.findOne({
        _id: { $in: ownedInstituteIds },
        isActive: true,
      }).sort({ updatedAt: -1 })) ||
      (await Institute.findOne({
        _id: { $in: ownedInstituteIds },
      }).sort({ createdAt: -1 }));
  }

  res.status(200).json({
    success: true,
    data: {
      institute: institute ? formatInstitute(institute) : null,
    },
  });
});

const getInstituteById = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const institute = await Institute.findById(req.params.id);

  if (!institute) {
    throw new AppError('Institute not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, institute._id);

  res.status(200).json({
    success: true,
    data: { institute: formatInstitute(institute) },
  });
});

const updateInstitute = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);

  const institute = await Institute.findById(req.params.id);

  if (!institute) {
    if (req.file) {
      deleteLogoFile(buildLogoPath(req.file));
    }

    throw new AppError('Institute not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, institute._id);

  const nextName = name ?? institute.name;
  const nextEmail = email ?? institute.email;

  const existingInstitute = await findDuplicateInstitute({
    name: nextName,
    email: nextEmail,
    excludeId: institute._id,
  });

  if (existingInstitute) {
    if (req.file) {
      deleteLogoFile(buildLogoPath(req.file));
    }

    if (existingInstitute.name.toLowerCase() === nextName.toLowerCase()) {
      throw new AppError('An institute with this name already exists', 409);
    }

    throw new AppError('An institute with this email already exists', 409);
  }

  const previousLogo = institute.logo;

  institute.name = nextName;
  institute.email = nextEmail;
  institute.phone = phone ?? institute.phone;
  institute.address = address ?? institute.address;
  institute.isActive = parseIsActive(req.body.isActive, institute.isActive);

  if (req.file) {
    institute.logo = buildLogoPath(req.file);
  }

  await institute.save();

  if (req.file && previousLogo) {
    deleteLogoFile(previousLogo);
  }

  res.status(200).json({
    success: true,
    message: 'Institute updated successfully',
    data: { institute: formatInstitute(institute) },
  });
});

const deleteInstitute = asyncHandler(async (req, res) => {
  const ownedInstituteIds = await getOwnedInstituteIds(req.admin);
  const institute = await Institute.findById(req.params.id);

  if (!institute) {
    throw new AppError('Institute not found', 404);
  }

  ensureInstituteAccess(ownedInstituteIds, institute._id);

  await institute.deleteOne();

  if (institute.logo) {
    deleteLogoFile(institute.logo);
  }

  res.status(200).json({
    success: true,
    message: 'Institute deleted successfully',
  });
});

module.exports = {
  createInstitute,
  getInstitutes,
  getActiveInstitute,
  getInstituteById,
  updateInstitute,
  deleteInstitute,
};
