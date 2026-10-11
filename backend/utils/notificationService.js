const Notification = require('../models/Notification');

const createNotification = async ({ userId, userRole = 'CITIZEN', reportId = null, title, message }) => {
  try {
    const notification = await Notification.create({
      userId,
      userRole,
      reportId,
      title,
      message,
    });

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

module.exports = { createNotification };
