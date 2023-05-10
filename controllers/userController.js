const User = require('../model/userModel');

const handleFactory = require('./handleFactory');

// const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

// ------------- GET ALL USERS
exports.getAllUsers = catchAsync(handleFactory.getAll(User));

// -------------- GET A USER
exports.getUser = catchAsync(handleFactory.getOne(User));

// ------------------ UPDATE A USER
exports.updateUser = catchAsync(handleFactory.getByIdAndUpdate(User));

// --------------- DELETE A USER
exports.deleteUser = catchAsync(handleFactory.getByIdAndDelete(User));

// ----------------- DELETE ALL USERS FOR DEVELOPMENT ONLY
exports.deleteAll = catchAsync(async function (req, res, next) {
  await User.deleteMany();

  res.status(204).json({ status: 'success', message: 'Successfully wiped out.' });
});

// ----------------- GET STATS
exports.getStat = catchAsync(async function (req, res, next) {
  const stat = await User.aggregate([
    {
      $lookup: {
        from: 'plans',
        foreignField: '_id',
        localField: 'subscription',
        as: 'subscription',
      },
    },
    {
      $unwind: { path: '$subscription' },
    },
    {
      $group: {
        _id: '$subscription.name',
        numOfusers: { $sum: 1 },
        emails: { $push: '$email' },
      },
    },
  ]);

  res.status(200).json({ status: 'success', data: stat });
});
