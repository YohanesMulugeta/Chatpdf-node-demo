const Plan = require('../model/planModel');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

exports.home = catchAsync(async function (req, res, next) {
  const plans = await Plan.find();

  res.render('index', { title: 'Home', plans });
});

exports.about = function (req, res, next) {
  res.render('about', { title: 'About' });
};

exports.pricing = catchAsync(async function (req, res, next) {
  const plans = await Plan.find();

  res.render('pricing', { title: 'Pricing', plans });
});

exports.register = function (req, res, next) {
  res.render('register');
};

exports.feature = function (req, res, next) {
  const { feature } = req.params;
  const view = feature === 'document-analyser' ? 'documentAnalyser' : 'referenceChecker';
  const title = feature
    .split('-')
    .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
    .join(' ');

  if (feature !== 'document-analyser' && feature !== 'reference-checker')
    return next(new AppError(`NO feature with title ${title}!`, 404));

  res.render(view, { featureTitle: title, title });
};

exports.features = function (req, res, next) {
  res.render('features', { title: 'Features' });
};

exports.error = function (req, res, next) {
  res.render('error', { title: 'Error!' });
};

exports.login = function (req, res, next) {
  res.render('login', { title: 'Login' });
};

exports.profile = function (req, res, next) {
  res.render('profile', { title: 'Profile' });
};

exports.terms = function (req, res, next) {
  res.render('terms', { title: 'Terms' });
};

exports.resetPassword = function (req, res, next) {
  const { token } = req.params;

  res.render('resetPassword', { title: 'Reset Passowrd', token });
};
