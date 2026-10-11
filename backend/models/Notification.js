const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userRole: { type: String, enum: ['CITIZEN', 'AUTHORITY', 'ADMIN'], default: 'CITIZEN', required: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
