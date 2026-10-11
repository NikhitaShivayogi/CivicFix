const mongoose = require('mongoose');

const authoritySchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['AUTHORITY'], default: 'AUTHORITY' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    profileImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Authority', authoritySchema);