const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: '' },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Road/Pothole',
        'Streetlight',
        'Garbage/Waste',
        'Water Leakage',
        'Drainage',
        'Public Property',
        'Traffic/Safety',
        'Fallen Tree',
        'Other',
      ],
      required: true,
    },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    images: { type: [String], default: [] },
    location: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'],
      default: 'PENDING',
    },
    authorityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Authority', default: null },
    remarks: { type: String, default: '' },
    resolutionImageUrl: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
