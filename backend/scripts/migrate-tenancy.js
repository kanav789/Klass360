require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Institute = require('../src/models/Institute');
const Branch = require('../src/models/Branch');
const Course = require('../src/models/Course');
const Section = require('../src/models/Section');
const User = require('../src/models/User');
const Lead = require('../src/models/Lead');
const Enquiry = require('../src/models/Enquiry');
const Admission = require('../src/models/Admission');
const Student = require('../src/models/Student');
const Fee = require('../src/models/Fee');

// Every entity inherits its instituteId from a parent document that already
// carries (or can be resolved to) one. fee resolves through admission.
const PARENT_MAP = [
  { model: Branch, field: 'instituteId', parentModel: null },
  { model: Course, field: null, parentModel: Branch, parentField: 'branchIds' },
  { model: Section, field: 'branchId', parentModel: Branch },
  { model: User, field: 'branchId', parentModel: Branch },
  { model: Lead, field: 'branchId', parentModel: Branch },
  { model: Enquiry, field: 'branchId', parentModel: Branch },
  { model: Admission, field: 'branchId', parentModel: Branch },
  { model: Student, field: 'branchId', parentModel: Branch },
  { model: Fee, field: null, parentModel: Admission, parentField: 'admissionId' },
];

const buildParentMap = async (parentModel) => {
  const docs = await parentModel.find().select('instituteId').lean();
  const map = new Map();

  for (const doc of docs) {
    if (doc.instituteId) {
      map.set(String(doc._id), String(doc.instituteId));
    }
  }

  return map;
};

const backfillModel = async ({ model, field, parentModel, parentField }) => {
  const name = model.modelName;

  if (!parentModel) {
    // Branch carries instituteId itself; nothing to resolve.
    console.log(`${name}: scoped via own instituteId, no backfill needed`);
    return;
  }

  const parentMap = await buildParentMap(parentModel);
  const docs = await model
    .find({ $or: [{ instituteId: { $exists: false } }, { instituteId: null }] })
    .select(field ?? parentField)
    .lean();

  let updated = 0;
  let skipped = 0;

  for (const doc of docs) {
    const parentIds = field
      ? [doc[field]]
      : parentField === 'branchIds'
        ? (doc.branchIds || [])
        : [doc[parentField]];

    let instituteId = null;

    for (const parentId of parentIds) {
      const resolved = parentMap.get(String(parentId));

      if (resolved) {
        instituteId = resolved;
        break;
      }
    }

    if (!instituteId) {
      skipped += 1;
      console.warn(`${name}: could not resolve instituteId for ${doc._id}`);
      continue;
    }

    await model.updateOne(
      { _id: doc._id },
      { $set: { instituteId: new mongoose.Types.ObjectId(instituteId) } },
    );
    updated += 1;
  }

  console.log(`${name}: backfilled ${updated}, skipped ${skipped}`);
};

const migrate = async () => {
  await connectDB();

  // Branch docs missing instituteId cannot be resolved from anywhere.
  const orphanBranches = await Branch.countDocuments({
    $or: [{ instituteId: { $exists: false } }, { instituteId: null }],
  });

  if (orphanBranches > 0) {
    console.warn(
      `Branch: ${orphanBranches} branch(es) have no instituteId and will stay unscoped`,
    );
  }

  for (const entry of PARENT_MAP) {
    await backfillModel(entry);
  }

  console.log('Syncing indexes (rebuilding unique constraints per institute)...');

  for (const model of [
    Institute,
    Branch,
    Course,
    Section,
    User,
    Lead,
    Enquiry,
    Admission,
    Student,
    Fee,
  ]) {
    await model.syncIndexes();
    console.log(`${model.modelName}: indexes synced`);
  }

  await mongoose.connection.close();
  console.log('Tenancy migration complete');
};

migrate().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
