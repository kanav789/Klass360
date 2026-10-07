const Institute = require('../models/Institute');
const AppError = require('./AppError');

const isSuperAdmin = (admin) => admin.role === 'superadmin';

// Returns null for superadmin (unrestricted), otherwise the array of
// institute ids created by this admin.
const getOwnedInstituteIds = async (admin) => {
  if (isSuperAdmin(admin)) {
    return null;
  }

  const institutes = await Institute.find({ createdBy: admin._id }).select('_id');
  return institutes.map((institute) => institute._id);
};

// Builds the instituteId filter for list queries. ownedInstituteIds === null
// means superadmin: no filter, unless they explicitly drill into one institute.
// A non-superadmin requesting an institute they do not own gets an empty result.
const buildInstituteFilter = (ownedInstituteIds, requestedInstituteId = null) => {
  if (ownedInstituteIds === null) {
    return requestedInstituteId ? { instituteId: requestedInstituteId } : {};
  }

  if (
    requestedInstituteId &&
    !ownedInstituteIds.some((id) => String(id) === String(requestedInstituteId))
  ) {
    return { instituteId: null };
  }

  return { instituteId: { $in: ownedInstituteIds } };
};

// Throws 404 unless the entity belongs to one of the admin's institutes.
// Superadmin (ownedInstituteIds === null) always passes.
const ensureInstituteAccess = (ownedInstituteIds, instituteId) => {
  if (ownedInstituteIds === null) {
    return;
  }

  if (
    !instituteId ||
    !ownedInstituteIds.some((id) => String(id) === String(instituteId))
  ) {
    throw new AppError('Record not found.', 404);
  }
};

module.exports = {
  isSuperAdmin,
  getOwnedInstituteIds,
  buildInstituteFilter,
  ensureInstituteAccess,
};
