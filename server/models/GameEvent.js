const mongoose = require('mongoose');

const GameEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  game: {
    type: String,
    required: [true, 'Game is required'],
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  timeZone: {
    type: String,
    default: 'UTC'
  },
  location: {
    type: String,
    enum: ['online', 'in-person', 'hybrid'],
    default: 'online'
  },
  // For online events
  platformDetails: {
    platform: {
      type: String,
      enum: ['pc', 'playstation', 'xbox', 'nintendo', 'mobile', 'other'],
      default: 'pc'
    },
    serverName: String,
    serverRegion: String,
    lobbyCode: String,
    voiceChat: {
      type: String,
      enum: ['discord', 'in-game', 'teamspeak', 'mumble', 'other'],
      default: 'discord'
    },
    voiceChatLink: String
  },
  // For in-person events
  venueDetails: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    venueNotes: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  minParticipants: {
    type: Number,
    default: 1
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['going', 'maybe', 'invited', 'declined'],
        default: 'going'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  tags: [String],
  eventType: {
    type: String,
    enum: ['casual', 'competitive', 'tournament', 'practice', 'coaching', 'other'],
    default: 'casual'
  },
  eventStatus: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  recurrence: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    endDate: Date,
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6
      }
    ] // 0 = Sunday, 6 = Saturday
  },
  notifications: {
    reminders: [
      {
        time: Number, // minutes before event
        sent: {
          type: Boolean,
          default: false
        }
      }
    ],
    sendReminders: {
      type: Boolean,
      default: true
    }
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

// Pre-save hook to update timestamps
GameEventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure start time is before end time
GameEventSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

// Create indexes for faster queries
GameEventSchema.index({ creator: 1 });
GameEventSchema.index({ game: 1 });
GameEventSchema.index({ startTime: 1 });
GameEventSchema.index({ 'participants.user': 1 });
GameEventSchema.index({ eventStatus: 1 });
GameEventSchema.index({ isPublic: 1 });

module.exports = mongoose.model('GameEvent', GameEventSchema);