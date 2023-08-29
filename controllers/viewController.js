const catchAsync = require('../util/catchAsync');
const Chat = require('../model/chatModel');

exports.home = catchAsync(async function (req, res, next) {
  const chats = await Chat.find();

  res.render('chatN', { title: 'Chat', chats });
});
