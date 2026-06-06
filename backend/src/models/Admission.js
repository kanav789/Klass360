const mongoose = require('mongoose');

const ADMISSION_STATUSES = ['pending', 'confirmed', 'active', 'cancelled'];

const admissionSchema = new mongoose.Schema(
  {
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      required: [true, 'Enquiry is required'],
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Batch is required'],
      // batch and section are the same entity (Section model)
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
    },
    totalFee: {
      type: Number,
      required: [true, 'Total fee is required'],
      min: [0, 'Total fee cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    netFee: {
      type: Number,
      min: [0, 'Net fee cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ADMISSION_STATUSES,
        message: `Status must be one of: ${ADMISSION_STATUSES.join(', ')}`,
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

admissionSchema.index({ enquiryId: 1 }, { unique: true });

admissionSchema.pre('validate', function () {
  const discount = this.discount ?? 0;
  const totalFee = this.totalFee ?? 0;

  if (discount > totalFee) {
    throw new Error('Discount cannot exceed total fee');
  }

  this.netFee = totalFee - discount;
});

const Admission = mongoose.model('Admission', admissionSchema);

module.exports = Admission;
module.exports.ADMISSION_STATUSES = ADMISSION_STATUSES;
