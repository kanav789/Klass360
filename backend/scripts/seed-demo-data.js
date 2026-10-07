require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');
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

const DEMO_PASSWORD = 'Demo@1234';
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const SPECS = [
  {
    admin: { fullName: 'Sunrise Admin', email: 'sunrise@klass360.com' },
    institute: {
      name: 'Sunrise Academy',
      email: 'contact@sunriseacademy.com',
      phone: '9876500011',
      address: '12 Park Road, Connaught Place, Delhi',
    },
    branches: [
      { name: 'Main Campus', code: 'SUN-M', address: '12 Park Road, Connaught Place', city: 'Delhi', state: 'Delhi' },
      { name: 'City Center', code: 'SUN-C', address: '8 Sector 18 Market', city: 'Noida', state: 'UP' },
    ],
    courses: [
      {
        name: 'JEE Foundation',
        category: 'Engineering',
        durationInMonths: 24,
        branchCodes: ['SUN-M', 'SUN-C'],
      },
      {
        name: 'NEET Crash Course',
        category: 'Medical',
        durationInMonths: 12,
        branchCodes: ['SUN-M'],
      },
    ],
    batches: [
      { name: 'JEE Morning', course: 'JEE Foundation', branch: 'SUN-M' },
      { name: 'JEE Evening', course: 'JEE Foundation', branch: 'SUN-C' },
      { name: 'NEET Morning', course: 'NEET Crash Course', branch: 'SUN-M' },
    ],
    users: [
      { firstName: 'Anita', lastName: 'Sharma', mobile: '9811000011', email: 'anita.sharma@sunriseacademy.com', role: 'manager', branch: 'SUN-M' },
      { firstName: 'Rohit', lastName: 'Verma', mobile: '9811000022', email: 'rohit.verma@sunriseacademy.com', role: 'counselor', branch: 'SUN-M' },
      { firstName: 'Priya', lastName: 'Nair', mobile: '9811000033', email: 'priya.nair@sunriseacademy.com', role: 'teacher', branch: 'SUN-C' },
    ],
    leads: [
      { name: 'Aarav Gupta', number: '9821001111', branch: 'SUN-M', course: 'JEE Foundation', source: 'referral' },
      { name: 'Isha Malhotra', number: '9821002222', branch: 'SUN-C', course: 'JEE Foundation', source: 'website' },
      { name: 'Kabir Singh', number: '9821003333', branch: 'SUN-M', course: 'NEET Crash Course', source: 'walkin' },
      { name: 'Meera Joshi', number: '9821004444', branch: 'SUN-C', course: 'JEE Foundation', source: 'offline_campaign' },
    ],
    enquiries: [
      { leadIndex: 0, status: 'interested', notes: 'Wants hostel facility details' },
      { leadIndex: 1, status: 'yet_to_decide', notes: 'Will decide after result' },
      { leadIndex: 2, status: 'see_in_future', notes: 'Follow up next month' },
    ],
    admissions: [
      { enquiryIndex: 0, totalFee: 60000, discount: 5000, status: 'active', paidAmount: 30000, qualification: 'Class 11' },
      { enquiryIndex: 1, totalFee: 55000, discount: 0, status: 'pending', paidAmount: 0, qualification: 'Class 12' },
    ],
  },
  {
    admin: { fullName: 'Excellence Admin', email: 'excellence@klass360.com' },
    institute: {
      name: 'Excellence Institute',
      email: 'hello@excellenceinstitute.com',
      phone: '9876500022',
      address: '45 MG Road, Sector 14, Haryana',
    },
    branches: [
      { name: 'Head Office', code: 'EXC-M', address: '45 MG Road, Sector 14', city: 'Gurugram', state: 'Haryana' },
      { name: 'West Branch', code: 'EXC-W', address: '201 Palam Vihar Road', city: 'Gurugram', state: 'Haryana' },
    ],
    courses: [
      {
        name: 'Class 10 Foundation',
        category: 'Academics',
        durationInMonths: 12,
        branchCodes: ['EXC-M', 'EXC-W'],
      },
      {
        name: 'Spoken English',
        category: 'Skills',
        durationInMonths: 6,
        branchCodes: ['EXC-M'],
      },
    ],
    batches: [
      { name: '10th Morning', course: 'Class 10 Foundation', branch: 'EXC-M' },
      { name: '10th Evening', course: 'Class 10 Foundation', branch: 'EXC-W' },
      { name: 'English Weekend', course: 'Spoken English', branch: 'EXC-M' },
    ],
    users: [
      { firstName: 'Sunita', lastName: 'Rao', mobile: '9812000011', email: 'sunita.rao@excellenceinstitute.com', role: 'manager', branch: 'EXC-M' },
      { firstName: 'Arjun', lastName: 'Mehta', mobile: '9812000022', email: 'arjun.mehta@excellenceinstitute.com', role: 'counselor', branch: 'EXC-M' },
      { firstName: 'Neha', lastName: 'Kapoor', mobile: '9812000033', email: 'neha.kapoor@excellenceinstitute.com', role: 'teacher', branch: 'EXC-W' },
    ],
    leads: [
      { name: 'Dev Patel', number: '9822001111', branch: 'EXC-M', course: 'Class 10 Foundation', source: 'referral' },
      { name: 'Tanya Arora', number: '9822002222', branch: 'EXC-W', course: 'Class 10 Foundation', source: 'website' },
      { name: 'Rahul Bose', number: '9822003333', branch: 'EXC-M', course: 'Spoken English', source: 'walkin' },
      { name: 'Sneha Reddy', number: '9822004444', branch: 'EXC-W', course: 'Class 10 Foundation', source: 'referral' },
    ],
    enquiries: [
      { leadIndex: 0, status: 'interested', notes: 'Parents will visit on Saturday' },
      { leadIndex: 1, status: 'not_interested', notes: 'Chose a nearby school' },
      { leadIndex: 2, status: 'interested', notes: 'Asked about weekend timing' },
    ],
    admissions: [
      { enquiryIndex: 0, totalFee: 40000, discount: 4000, status: 'active', paidAmount: 36000, qualification: 'Class 9' },
      { enquiryIndex: 2, totalFee: 18000, discount: 0, status: 'pending', paidAmount: 5000, qualification: 'Graduate' },
    ],
  },
];

const ensureAdmin = async ({ fullName, email }) => {
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log(`Admin ${email} already exists, reusing it`);
    return existing;
  }

  const admin = await Admin.create({
    fullName,
    email,
    password: DEMO_PASSWORD,
    role: 'admin',
  });

  console.log(`Admin created: ${email} / ${DEMO_PASSWORD}`);
  return admin;
};

// Demo-seeder reset semantics: any existing data for this institute name is
// removed first, so re-running the script always produces complete datasets.
const wipeInstituteData = async (instituteName) => {
  const institute = await Institute.findOne({ name: instituteName });

  if (!institute) {
    return false;
  }

  const admissions = await Admission.find({ instituteId: institute._id }).select('_id studentId');
  const admissionIds = admissions.map((admission) => admission._id);

  await Fee.deleteMany({ admissionId: { $in: admissionIds } });
  await Student.deleteMany({ admissionId: { $in: admissionIds } });
  await Admission.deleteMany({ instituteId: institute._id });
  await Enquiry.deleteMany({ instituteId: institute._id });
  await Lead.deleteMany({ instituteId: institute._id });
  await User.deleteMany({ instituteId: institute._id });
  await Section.deleteMany({ instituteId: institute._id });
  await Course.deleteMany({ instituteId: institute._id });
  await Branch.deleteMany({ instituteId: institute._id });
  await Institute.deleteOne({ _id: institute._id });

  console.log(`Reset existing demo institute "${instituteName}"`);
  return true;
};

const seedInstitute = async (admin, spec) => {
  await wipeInstituteData(spec.institute.name);

  const institute = await Institute.create({
    ...spec.institute,
    isActive: true,
    createdBy: admin._id,
  });

  const branches = {};

  for (const branchSpec of spec.branches) {
    branches[branchSpec.code] = await Branch.create({
      ...branchSpec,
      instituteId: institute._id,
      status: 'active',
      createdBy: admin._id,
    });
  }

  const courses = {};

  for (const courseSpec of spec.courses) {
    courses[courseSpec.name] = await Course.create({
      instituteId: institute._id,
      name: courseSpec.name,
      category: courseSpec.category,
      durationInMonths: courseSpec.durationInMonths,
      description: '',
      branchIds: courseSpec.branchCodes.map((code) => branches[code]._id),
      isActive: true,
    });
  }

  const batches = [];

  for (const batchSpec of spec.batches) {
    batches.push(
      await Section.create({
        instituteId: institute._id,
        name: batchSpec.name,
        courseId: courses[batchSpec.course]._id,
        branchId: branches[batchSpec.branch]._id,
        startDate: daysFromNow(15),
        endDate: daysFromNow(210),
        isActive: true,
      }),
    );
  }

  const staff = [];

  for (const userSpec of spec.users) {
    staff.push(
      await User.create({
        ...userSpec,
        branchId: branches[userSpec.branch]._id,
        instituteId: institute._id,
      }),
    );
  }

  const counselor = staff.find((user) => user.role === 'counselor') ?? staff[0];

  const leads = [];

  for (const leadSpec of spec.leads) {
    leads.push(
      await Lead.create({
        name: leadSpec.name,
        number: leadSpec.number,
        whatsappNumber: leadSpec.number,
        alternateNumber: '',
        branchId: branches[leadSpec.branch]._id,
        instituteId: institute._id,
        courseId: courses[leadSpec.course]._id,
        source: leadSpec.source,
        assignedTo: counselor._id,
      }),
    );
  }

  const enquiries = [];

  for (let index = 0; index < spec.enquiries.length; index += 1) {
    const enquirySpec = spec.enquiries[index];
    const lead = leads[enquirySpec.leadIndex];

    enquiries.push(
      await Enquiry.create({
        leadId: lead._id,
        courseId: lead.courseId,
        branchId: lead.branchId,
        instituteId: institute._id,
        assignedTo: lead.assignedTo,
        enquiryDate: daysFromNow(-(index + 2)),
        status: enquirySpec.status,
        notes: enquirySpec.notes,
      }),
    );
  }

  for (const admissionSpec of spec.admissions) {
    const enquiry = enquiries[admissionSpec.enquiryIndex];
    const lead = leads.find(
      (item) => String(item._id) === String(enquiry.leadId),
    );
    const batch = batches.find(
      (item) =>
        String(item.courseId) === String(enquiry.courseId) &&
        String(item.branchId) === String(enquiry.branchId),
    );

    if (!batch) {
      throw new Error(
        `No batch found for ${lead.name} (course ${enquiry.courseId}, branch ${enquiry.branchId})`,
      );
    }

    const admission = await Admission.create({
      enquiryId: enquiry._id,
      leadId: lead._id,
      courseId: enquiry.courseId,
      branchId: enquiry.branchId,
      batchId: batch._id,
      instituteId: institute._id,
      admissionDate: daysFromNow(-1),
      totalFee: admissionSpec.totalFee,
      discount: admissionSpec.discount,
      status: admissionSpec.status,
    });

    const student = await Student.create({
      leadId: lead._id,
      admissionId: admission._id,
      fullName: lead.name,
      mobile: lead.number,
      whatsappNumber: lead.whatsappNumber,
      email: '',
      alternateMobile: '',
      qualification: admissionSpec.qualification,
      branchId: enquiry.branchId,
      instituteId: institute._id,
      isActive: admissionSpec.status !== 'cancelled',
    });

    admission.studentId = student._id;
    await admission.save();

    await Fee.create({
      admissionId: admission._id,
      instituteId: institute._id,
      discount: admission.discount,
      netFee: admission.netFee,
      paidAmount: admissionSpec.paidAmount,
    });
  }

  console.log(
    `Seeded "${institute.name}": ${spec.branches.length} branches, ` +
      `${spec.courses.length} courses, ${spec.batches.length} batches, ` +
      `${spec.users.length} staff, ${spec.leads.length} leads, ` +
      `${spec.enquiries.length} enquiries, ${spec.admissions.length} admissions/students/fees`,
  );
};

const seedDemoData = async () => {
  await connectDB();

  for (const spec of SPECS) {
    const admin = await ensureAdmin(spec.admin);
    await seedInstitute(admin, spec);
  }

  console.log('\n=== Demo accounts ===');
  console.log('Superadmin : superadmin@klass360.com / Super@1234');
  console.log('Existing   : admin@klass360.edu (your current password)');
  console.log(`Sunrise    : sunrise@klass360.com / ${DEMO_PASSWORD}`);
  console.log(`Excellence : excellence@klass360.com / ${DEMO_PASSWORD}`);

  await mongoose.connection.close();
};

seedDemoData().catch((error) => {
  console.error('Demo seeding failed:', error.message);
  process.exit(1);
});
