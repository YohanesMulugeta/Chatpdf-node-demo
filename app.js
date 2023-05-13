const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimiter = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');

const pdfRouter = require('./routes/processPdfRouter');
const viewRouter = require('./routes/viewRouter');

const appErrorHandler = require('./controllers/errorController');
const AppError = require('./util/AppError');

const app = express();

app.use(express.json({ limit: '150kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());
app.use(hpp());

app.use(express.static('public'));

app.set('view engine', 'pug');

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: {
//         'script-src': [
//           "'self'",
//           'https://accounts.google.com/gsi/client',
//           'https://cdn.jsdelivr.net/npm/',
//           'https://cdnjs.cloudflare.com/ajax/',
//         ],
//         'connect-src': [
//           "'self'",
//           'https://accounts.google.com/gsi/',
//           'https://fonts.gstatic.com',
//           'https://fonts.googleapis.com',
//           'https://api.ipify.org/',
//         ],
//         'frame-src': ["'self'", 'https://accounts.google.com/gsi/'],
//         'style-src': [
//           "'self'",
//           'https://accounts.google.com/gsi/',
//           'https://cdn.jsdelivr.net/npm/',
//           'https://fonts.googleapis.com/',
//           "'unsafe-inline'",
//         ],
//       },
//     },
//     crossOriginOpenerPolicy: { policy: 'unsafe-none' },
//   })
// );

app.use(
  '/api',
  rateLimiter({
    max: 30,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour!',
  })
);

app.use(compression());

app.use(mongoSanitize({ replaceWith: '_' }));

app.use(xss());

app.use('/api/v1/pdf', pdfRouter);
app.use('/', viewRouter);

app.use('*', (req, res, next) => {
  return next(
    new AppError('There is no route diffinition with this url on our server.', 404)
  );
});

app.use(appErrorHandler);

module.exports = app;
