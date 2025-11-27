const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userMessage: {
    type: String,
    required: true
  },
  botResponse: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 172800 // 2 days in seconds (60 * 60 * 24 * 2)
  }
});

module.exports = mongoose.model('Chat', chatSchema);
