const express = require('express');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const StatusHistory = require('../models/StatusHistory');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { createNotification } = require('../utils/notificationService');

const router = express.Router();

router.get('/reports', protect, authorizeRoles('AUTHORITY'), async (req, res, next) => {
  try {
    const { status, category, search, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { reportId: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const reports = await Report.find(query)
      .populate('citizenId', 'name email phone locality district state')
      .populate('authorityId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/:id', protect, authorizeRoles('AUTHORITY'), async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('citizenId', 'name email phone locality district state')
      .populate('authorityId', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const history = await StatusHistory.find({ reportId: report._id }).sort({ createdAt: 1 }).populate('updatedBy', 'name');

    res.json({ report, history });
  } catch (error) {
    next(error);
  }
});

router.patch('/reports/:id/assign', protect, authorizeRoles('AUTHORITY'), async (req, res, next) => {
  try {
    const report = await Report.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ authorityId: null }, { authorityId: req.user._id }],
      },
      { $set: { authorityId: req.user._id } },
      { new: true }
    );

    if (!report) {
      const existingReport = await Report.findById(req.params.id).populate('authorityId', 'name');
      if (!existingReport) {
        return res.status(404).json({ message: 'Report not found' });
      }
      return res.status(409).json({
        message: `This issue is already assigned to ${existingReport.authorityId?.name || 'another authority'}.`,
      });
    }

    await createNotification({
      userId: report.citizenId,
      reportId: report._id,
      title: 'Authority assigned',
      message: `Your report ${report.reportId} is now being handled by ${req.user.name}.`,
    });

    res.json({ report, message: 'Issue assigned to you' });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/reports/:id/status',
  protect,
  authorizeRoles('AUTHORITY'),
  [
    body('status').isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE']).withMessage('Invalid status'),
    body('remark').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const report = await Report.findById(req.params.id);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      if (!report.authorityId) {
        return res.status(409).json({ message: 'Take responsibility for this issue before updating it.' });
      }
      if (report.authorityId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the responsible authority can update this issue.' });
      }

      const previousStatus = report.status;
      const newStatus = req.body.status;

      report.status = newStatus;
      report.remarks = req.body.remark || report.remarks;
      report.resolvedAt = newStatus === 'RESOLVED' ? new Date() : null;
      await report.save();

      await StatusHistory.create({
        reportId: report._id,
        previousStatus,
        newStatus,
        updatedBy: req.user._id,
        remark: req.body.remark || '',
      });

      const title = newStatus === 'RESOLVED' ? 'Issue resolved' : 'Status updated';
      const message =
        newStatus === 'RESOLVED'
          ? `Your report ${report.reportId} has been resolved by the authority.`
          : `The status of your report ${report.reportId} is now ${newStatus}.`;

      await createNotification({
        userId: report.citizenId,
        reportId: report._id,
        title,
        message,
      });

      res.json({ report, message: 'Status updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/reports/:id/remarks',
  protect,
  authorizeRoles('AUTHORITY'),
  [
    body('remark').trim().notEmpty().withMessage('Remark is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const report = await Report.findById(req.params.id);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      if (!report.authorityId) {
        return res.status(409).json({ message: 'Take responsibility for this issue before adding a remark.' });
      }
      if (report.authorityId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the responsible authority can update this issue.' });
      }

      report.remarks = req.body.remark;
      await report.save();

      await createNotification({
        userId: report.citizenId,
        reportId: report._id,
        title: 'Authority update',
        message: `An authority has added a new remark to report ${report.reportId}.`,
      });

      res.json({ report, message: 'Remark added successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
