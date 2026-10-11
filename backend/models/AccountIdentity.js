const mongoose = require('mongoose');

const accountIdentitySchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['CITIZEN', 'AUTHORITY', 'ADMIN'], required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AccountIdentity', accountIdentitySchema);