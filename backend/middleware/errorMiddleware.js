const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  const isUploadError = err instanceof multer.MulterError || err.message === 'Only JPG, JPEG, PNG, and WEBP images are allowed';
  const statusCode = isUploadError ? 400 : res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.code === 'LIMIT_FILE_SIZE'
      ? 'Each photo must be 5 MB or smaller.'
      : err.code === 'LIMIT_FILE_COUNT'
        ? 'A report can include up to 5 photos.'
        : err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { errorHandler };
