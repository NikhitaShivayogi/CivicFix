const express = require('express');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const StatusHistory = require('../models/StatusHistory');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const generateReportId = require('../utils/generateReportId');
const { createNotification } = require('../utils/notificationService');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  authorizeRoles('CITIZEN'),
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'image', maxCount: 1 },
  ]),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const uploadedFiles = [...(req.files?.images || []), ...(req.files?.image || [])];
      const imageUrls = uploadedFiles.map((file) => (
        /^https?:\/\//i.test(file.path || '') ? file.path : `/uploads/${file.filename}`
      ));
      const reportPayload = {
        citizenId: req.user._id,
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        imageUrl: imageUrls[0] || '',
        images: imageUrls,
        location: {
          latitude: Number(req.body.location.latitude),
          longitude: Number(req.body.location.longitude),
          address: req.body.location.address || '',
        },
      };

      const reportId = await generateReportId(Report);
      const report = await Report.create({ ...reportPayload, reportId });

      await createNotification({
        userId: req.user._id,
        reportId: report._id,
        title: 'Issue submitted',
        message: `Your report ${reportId} has been received and is under review.`,
      });

      res.status(201).json({ report, message: 'Report submitted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/my', protect, authorizeRoles('CITIZEN'), async (req, res, next) => {
  try {
    const reports = await Report.find({ citizenId: req.user._id }).sort({ createdAt: -1 }).populate('authorityId', 'name email');
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

router.get('/admin', protect, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = String(req.query.search || '').trim().slice(0, 100);
    const query = {};

    if (['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'].includes(req.query.status)) {
      query.status = req.query.status;
    }
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedSearch, 'i');
      query.$or = [
        { reportId: pattern },
        { title: pattern },
        { category: pattern },
        { 'location.address': pattern },
      ];
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('citizenId', 'name email phone locality district state')
        .populate('authorityId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    res.json({
      reports,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('citizenId', 'name email phone')
      .populate('authorityId', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role === 'CITIZEN' && report.citizenId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    const history = await StatusHistory.find({ reportId: report._id }).sort({ createdAt: 1 }).populate('updatedBy', 'name');

    res.json({ report, history });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
