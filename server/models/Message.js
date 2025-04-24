const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  attachments: [{
    type: String,
    default: []
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
MessageSchema.index({ sender: 1, recipient: 1 });
MessageSchema.index({ conversation: 1 });
MessageSchema.index({ createdAt: -1 });

// When message is marked as read, update readAt
MessageSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read) {
    this.readAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Message', MessageSchema);