const mongoose = require('mongoose');

const LEAD_SOURCES = ['referral', 'website', 'walkin', 'offline_campaign'];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Lead name cannot exceed 100 characters'],
    },
    number: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number'],
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit WhatsApp number'],
    },
    alternateNumber: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          if (!value) return true;
          return /^[6-9]\d{9}$/.test(value);
        },
        message: 'Please provide a valid 10-digit alternate number',
      },
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: [true, 'Institute is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Interested course is required'],
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: {
        values: LEAD_SOURCES,
        message: `Source must be one of: ${LEAD_SOURCES.join(', ')}`,
      },
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required'],
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

leadSchema.index({ instituteId: 1, number: 1 }, { unique: true });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
module.exports.LEAD_SOURCES = LEAD_SOURCES;
