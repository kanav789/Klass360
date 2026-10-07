const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: [true, 'Institute is required'],
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [150, 'Course name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true,
      maxlength: [100, 'Course category cannot exceed 100 characters'],
    },
    durationInMonths: {
      type: Number,
      required: [true, 'Course duration is required'],
      min: [1, 'Duration must be at least 1 month'],
      max: [120, 'Duration cannot exceed 120 months'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    branchIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
      },
    ],
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

courseSchema.index({ instituteId: 1, name: 1 }, { unique: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
