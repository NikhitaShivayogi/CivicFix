const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['ADMIN'], default: 'ADMIN' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);