require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Citizen = require('../models/Citizen');
const Authority = require('../models/Authority');
const Admin = require('../models/Admin');
const AccountIdentity = require('../models/AccountIdentity');
const Notification = require('../models/Notification');

const modelsByRole = {
  CITIZEN: Citizen,
  AUTHORITY: Authority,
  ADMIN: Admin,
};

async function migrateRoleCollections() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be set before migrating account collections');
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  const legacyUsers = await User.find().lean();
  const counts = { CITIZEN: 0, AUTHORITY: 0, ADMIN: 0 };

  for (const legacyUser of legacyUsers) {
    const Model = modelsByRole[legacyUser.role];
    if (!Model) {
      throw new Error(`Cannot migrate account ${legacyUser.email}: unsupported role ${legacyUser.role}`);
    }

    const { _id, role, ...profile } = legacyUser;
    profile.email = profile.email.trim().toLowerCase();
    if (role !== 'AUTHORITY') delete profile.approvalStatus;

    const existingIdentity = await AccountIdentity.findOne({ email: profile.email });
    if (existingIdentity && (
      existingIdentity.role !== role || existingIdentity.accountId.toString() !== _id.toString()
    )) {
      throw new Error(`Email ${profile.email} is already registered to a different account`);
    }

    await Model.updateOne({ _id }, { $setOnInsert: profile }, { upsert: true, timestamps: false });
    if (!existingIdentity) {
      await AccountIdentity.create({ email: profile.email, role, accountId: _id });
    }
    counts[role] += 1;
  }

  await Notification.updateMany(
    { userRole: { $exists: false } },
    { $set: { userRole: 'CITIZEN' } }
  );

  console.log(`Migration complete. Copied ${counts.CITIZEN} citizens, ${counts.AUTHORITY} authorities, and ${counts.ADMIN} admins.`);
  console.log('The original users collection was kept unchanged as a backup.');
}

migrateRoleCollections()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());