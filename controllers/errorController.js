const AppError = require('../util/AppError');

// --------------------------- DEV ERROR
function handleDevErr(err, req, res) {
  if (req.originalUrl.startsWith('/api'))
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err,
      stack: err.stack,
    });
  else
    res.render('error', {
      title: 'Something Went Wrong',
      errMessage: err.message,
      statusCode: err.statusCode,
      renderLoginOrRegister: req.renderLoginOrRegister,
    });
}

function handleProError(err, req, res) {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res
        .status(err.statusCode)
        .json({ status: err.status, message: err.message });

    // console.log('Error', err);

    return res.status(500).json({
      status: 'Fail',
      message: 'Something went wrong. Please try again.',
    });
  }

  if (err.isOperational)
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong.',
      errMessage: err.message,
      statusCode: err.statusCode,
    });

  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong',
    errMessage: 'Please tryagain',
    statusCode: 500,
  });
}

function handleCastError(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}
function handleDuplicateErr(err) {
  const [key, value] = Object.entries(err.keyValue)[0];

  return new AppError(
    `There is a user with ${key}: ${value}, please use another ${key}`,
    400
  );
}

function handleWebTokenError() {
  return new AppError('Invalid Web Token, Please login and try again.', 400);
}

function handleValidationError(err) {
  return new AppError(err.message, 400);
}

function handleEmailSubscriptionFail(err) {
  return new AppError('Maximum credits exceeded', 400);
}

module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  let error = { ...err, message: err.message };

  if (err.code === 11000) error = handleDuplicateErr(err);
  if (err.code === 'EAUTH') error = handleEmailSubscriptionFail(err);
  if (err.name === 'JsonWebTokenError') error = handleWebTokenError();
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'CastError') error = handleCastError(err);

  if (process.env.NODE_ENV === 'development') {
    return handleDevErr(err, req, res);
  }

  handleProError(error, req, res);
};
