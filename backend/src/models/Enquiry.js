const mongoose = require('mongoose');

const ENQUIRY_STATUSES = [
  'interested',
  'not_interested',
  'yet_to_decide',
  'see_in_future',
];

const enquirySchema = new mongoose.Schema(
  {
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
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: [true, 'Institute is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required'],
    },
    enquiryDate: {
      type: Date,
      required: [true, 'Enquiry date is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ENQUIRY_STATUSES,
        message: `Status must be one of: ${ENQUIRY_STATUSES.join(', ')}`,
      },
      default: 'yet_to_decide',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
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

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
module.exports.ENQUIRY_STATUSES = ENQUIRY_STATUSES;
