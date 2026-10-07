require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');

const seedSuperadmin = async () => {
  await connectDB();

  const email = (process.env.SUPERADMIN_EMAIL || 'superadmin@klass360.com').toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || 'Super@1234';

  const existing = await Admin.findOne({ email });

  if (existing) {
    if (existing.role !== 'superadmin') {
      existing.role = 'superadmin';
      await existing.save({ validateBeforeSave: false });
      console.log(`Existing admin ${email} promoted to superadmin`);
    } else {
      console.log(`Superadmin ${email} already exists, nothing to do`);
    }

    await mongoose.connection.close();
    return;
  }

  await Admin.create({
    fullName: 'Super Admin',
    email,
    password,
    role: 'superadmin',
  });

  console.log(`Superadmin created: ${email}`);

  await mongoose.connection.close();
};

seedSuperadmin().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
