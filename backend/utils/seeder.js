require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const AccountIdentity = require('../models/AccountIdentity');

async function seedAdmin() {
  const required = ['MONGO_URI'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Set these environment variables before seeding: ${missing.join(', ')}`);
  }

  const adminName = process.env.ADMIN_NAME || 'CivicFix Admin';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civicfix.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (adminPassword.length < 6) {
    throw new Error('ADMIN_PASSWORD must be at least 6 characters');
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  const existingIdentity = await AccountIdentity.findOne({ email: adminEmail });
  if (existingIdentity) {
    if (existingIdentity.role !== 'ADMIN' || !(await Admin.exists({ _id: existingIdentity.accountId }))) {
      throw new Error(`The email ${adminEmail} is already assigned to another account`);
    }
    console.log(`Admin already exists: ${adminEmail}`);
    return;
  }

  const accountId = new mongoose.Types.ObjectId();
  await AccountIdentity.create({ email: adminEmail, role: 'ADMIN', accountId });
  let admin;
  try {
    admin = await Admin.create({
      _id: accountId,
      name: adminName.trim(),
      email: adminEmail,
      phone: process.env.ADMIN_PHONE || '+10000000000',
      password: await bcrypt.hash(adminPassword, 10),
    });
  } catch (error) {
    await AccountIdentity.deleteOne({ accountId });
    throw error;
  }

  console.log(`Default admin created: ${admin.email}`);
}

seedAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
