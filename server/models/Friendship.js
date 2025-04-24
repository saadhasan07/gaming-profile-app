const mongoose = require('mongoose');

const FriendshipSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure users can't have duplicate friendship entries
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Update the timestamp when friendship status changes
FriendshipSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Friendship', FriendshipSchema);