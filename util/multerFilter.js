const AppError = require('./AppError');

const multerFilter = (req, file, cb) => {
  let error;
  switch (file.mimetype) {
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      req.type = 'doc';
      break;
    case 'text/csv':
      req.type = 'csv';
      break;
    case 'application/pdf':
      req.type = 'pdf';
      break;
    case 'application/epub+zip':
      req.type = 'epub';
      break;

    default:
      error = new AppError(
        'Not Pdf! Please upload only doc, csv, epub, or pdf. Pdfs are faster',
        400
      );
      break;
  }

  cb(error, req.type);
};

module.exports = multerFilter;
