require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');

const resetAdminPassword = async () => {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword) {
    console.error(
      'Usage: node scripts/reset-admin-password.js <email> <newPassword>',
    );
    console.error(
      'Example: node scripts/reset-admin-password.js admin@klass360.edu NewPass@123',
    );
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  await connectDB();

  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    console.error(`No admin account found for ${email}`);
    await mongoose.connection.close();
    process.exit(1);
  }

  admin.password = newPassword;
  await admin.save();

  console.log(`Password reset successfully for ${admin.email} (${admin.role})`);

  await mongoose.connection.close();
};

resetAdminPassword().catch((error) => {
  console.error('Password reset failed:', error.message);
  process.exit(1);
});
