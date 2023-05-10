class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.isOperational = true;
    this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error';

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
