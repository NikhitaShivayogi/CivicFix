require('dotenv').config();
const mongoose = require('mongoose');
const Authority = require('../models/Authority');

async function reviewAuthority() {
  const [decision, email] = process.argv.slice(2);

  if (!['approve', 'reject'].includes(decision) || !email || process.argv.length !== 4) {
    throw new Error('Usage: npm run review-authority -- <approve|reject> <email>');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be set before reviewing authority registrations');
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  const authority = await Authority.findOne({ email: email.trim().toLowerCase() });
  if (!authority) {
    throw new Error('No authority account found with that email');
  }

  authority.approvalStatus = decision === 'approve' ? 'APPROVED' : 'REJECTED';
  await authority.save();
  console.log(`Authority account ${decision}d: ${authority.email}`);
}

reviewAuthority()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
