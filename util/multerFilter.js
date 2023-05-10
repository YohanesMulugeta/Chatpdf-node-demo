const AppError = require('./AppError');

const multerFilter = (req, file, cb) => {
  const isPdf = file.mimetype.startsWith('application/pdf');
  const error = isPdf ? null : new AppError('Not Pdf! Please upload only image.', 400);

  cb(error, isPdf);
};

module.exports = multerFilter;
