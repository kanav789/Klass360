const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead is required'],
    },
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
      required: [true, 'Admission is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit mobile number'],
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit WhatsApp number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate: {
        validator(value) {
          if (!value) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
    alternateMobile: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          if (!value) return true;
          return /^[6-9]\d{9}$/.test(value);
        },
        message: 'Please provide a valid 10-digit alternate mobile number',
      },
    },
    qualification: {
      type: String,
      trim: true,
      maxlength: [200, 'Qualification cannot exceed 200 characters'],
      default: '',
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
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

studentSchema.index({ admissionId: 1 }, { unique: true });
studentSchema.index({ leadId: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
