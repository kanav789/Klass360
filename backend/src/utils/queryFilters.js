const mongoose = require('mongoose');
const AppError = require('./AppError');

const getBranchIdFromQuery = (query) => {
  const { branchId } = query;

  if (!branchId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    throw new AppError('Invalid branch ID in filter', 400);
  }

  return branchId;
};

const getInstituteIdFromQuery = (query) => {
  const { instituteId } = query;

  if (!instituteId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(instituteId)) {
    throw new AppError('Invalid institute ID in filter', 400);
  }

  return instituteId;
};

module.exports = {
  getBranchIdFromQuery,
  getInstituteIdFromQuery,
};
