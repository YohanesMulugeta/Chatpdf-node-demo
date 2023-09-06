const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const catchAsync = require('../util/catchAsync');
const Chat = require('../model/chatModel');
const User = require('../model/userModel');

exports.home = catchAsync(async function (req, res, next) {
  const { authorization } = req.headers;

  const token =
    (authorization?.startsWith('Bearer') && authorization.split(' ')[1]) ||
    req.cookies.jwt;

  if (!token) return res.status(200).redirect('/login');

  let uId;
  try {
    const { id, iat } = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    uId = id;
  } catch (err) {
    return res.status(200).redirect('/login');
  }

  const user = await User.findById(uId).select('+password');

  if (!user) return res.status(200).redirect('/login');

  const chats = await Chat.find();

  res.render('chatN', { title: 'Chat', chats });
});

exports.login = function (req, res, next) {
  res.render('login', { title: 'Login' });
};
