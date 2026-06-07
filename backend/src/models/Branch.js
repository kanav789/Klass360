const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: [true, 'Institute is required'],
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [150, 'Branch name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      trim: true,
      uppercase: true,
      maxlength: [20, 'Branch code cannot exceed 20 characters'],
    },
    address: {
      type: String,
      required: [true, 'Branch address is required'],
      trim: true,
      maxlength: [500, 'Branch address cannot exceed 500 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

branchSchema.index({ instituteId: 1, name: 1 }, { unique: true });
branchSchema.index({ instituteId: 1, code: 1 }, { unique: true });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
