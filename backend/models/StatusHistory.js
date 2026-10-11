const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
    previousStatus: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE', null],
      default: null,
    },
    newStatus: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'],
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Authority', required: true },
    remark: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StatusHistory', statusHistorySchema);
