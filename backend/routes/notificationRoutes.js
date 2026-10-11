const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id, userRole: req.user.role }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id, userRole: req.user.role });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ notification, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
