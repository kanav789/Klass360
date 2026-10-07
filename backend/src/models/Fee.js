const mongoose = require('mongoose');

const FEE_STATUSES = ['pending', 'partial', 'paid'];

const feeSchema = new mongoose.Schema(
  {
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
      required: [true, 'Admission is required'],
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: [true, 'Institute is required'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    netFee: {
      type: Number,
      required: [true, 'Net fee is required'],
      min: [0, 'Net fee cannot be negative'],
    },
    paidAmount: {
      type: Number,
      required: [true, 'Paid amount is required'],
      min: [0, 'Paid amount cannot be negative'],
    },
    pendingAmount: {
      type: Number,
      min: [0, 'Pending amount cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: FEE_STATUSES,
        message: `Status must be one of: ${FEE_STATUSES.join(', ')}`,
      },
      default: 'pending',
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

feeSchema.index({ admissionId: 1 }, { unique: true });

feeSchema.pre('validate', function () {
  const netFee = this.netFee ?? 0;
  const paidAmount = this.paidAmount ?? 0;

  if (paidAmount > netFee) {
    throw new Error('Paid amount cannot exceed net fee');
  }

  this.pendingAmount = netFee - paidAmount;

  if (paidAmount <= 0) {
    this.status = 'pending';
  } else if (paidAmount < netFee) {
    this.status = 'partial';
  } else {
    this.status = 'paid';
  }
});

const Fee = mongoose.model('Fee', feeSchema);

module.exports = Fee;
module.exports.FEE_STATUSES = FEE_STATUSES;
