const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Chats must have a name'] },
  chatHistory: { type: [[String]], select: false },
  nameSpace: {
    type: String,
    required: [true, 'Chat must have a nameSpace'],
    unique: true,
  },
  indexName: { type: String, required: [true, 'Chat must have a name'] },
  lastUpdatedAt: { type: Date, default: Date.now() },

  docs: [String],
});

chatSchema.pre('save', function (next) {
  if (!this.isNew) return next();
  this.chatHistory = [];

  next();
});

chatSchema.pre('save', function (next) {
  this.lastUpdatedAt = Date.now();

  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
