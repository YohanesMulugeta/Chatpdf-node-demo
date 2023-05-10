const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

const User = require('../model/userModel');
const Plan = require('../model/planModel');

exports.users = catchAsync(async function (req, res, next) {
  const limit = 9;
  const numOfPages = (await User.count()) / limit;
  const page = +req.query.page > Math.ceil(numOfPages) ? 1 : req.query.page || 1;

  const skip = (Math.abs(+page) - 1) * limit;

  const users = await User.find()
    .sort('-createdAt')
    .select('+emailVerified')
    .skip(skip)
    .limit(limit);
  const plans = await Plan.find();

  res.render('adminUsers', { title: 'Manage Users', users, numOfPages, page, plans });
});
