const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [150, 'Branch name cannot exceed 150 characters'],
    },
    address: {
      type: String,
      required: [true, 'Branch address is required'],
      trim: true,
      maxlength: [500, 'Branch address cannot exceed 500 characters'],
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

branchSchema.index({ name: 1 }, { unique: true });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
