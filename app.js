const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const hpp = require('hpp');
const rateLimiter = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

const expressWs = require('express-ws')(app);

const pdfRouter = require('./routes/processPdfRouter');
const chatRouter = require('./routes/chatRouter');
const viewRouter = require('./routes/viewRouter');
const appErrorHandler = require('./controllers/errorController');
const AppError = require('./util/AppError');

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());
app.use(hpp());
app.use(cors());

app.use('/api/v1/chat', chatRouter);
app.use(express.static('public'));

app.set('view engine', 'pug');

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(
  '/api',
  rateLimiter({
    max: 30,
    windowMs: 120 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour!',
  })
);

app.use(compression());

app.use(xss());
app.use('/api/v1/pdf', pdfRouter);
app.use('/', viewRouter);

// app.use('/api/v1/plans', planRouter);
// app.use('/api/v1/features', featureRouter);
// app.use('/admin', adminRouter);
// app.use('/', viewRouter);

app.use('*', (req, res, next) => {
  console.log(req.originalUrl);
  return next(
    new AppError('There is no route diffinition with this url on our server.', 404)
  );
});

app.use(appErrorHandler);

module.exports = app;
