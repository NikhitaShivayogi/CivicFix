const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['CITIZEN'], default: 'CITIZEN' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    locality: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    profileImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Citizen', citizenSchema);