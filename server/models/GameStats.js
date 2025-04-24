const mongoose = require('mongoose');

const GameStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['pc', 'playstation', 'xbox', 'nintendo', 'mobile', 'other'],
  },
  gamertag: {
    type: String,
    trim: true
  },
  playtime: {
    type: Number, // In minutes
    default: 0
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  },
  achievements: [
    {
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        default: ''
      },
      iconUrl: {
        type: String,
        default: ''
      },
      unlockedDate: {
        type: Date,
        default: Date.now
      },
      rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
      },
      rarityPercentage: {
        type: Number, // Percentage of players who have this achievement
        default: 0
      },
      isShared: {
        type: Boolean,
        default: false
      }
    }
  ],
  // Generic stats - these are the common ones across most games
  statistics: {
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    draws: {
      type: Number,
      default: 0
    },
    killDeathRatio: {
      type: Number,
      default: 0
    },
    kills: {
      type: Number,
      default: 0
    },
    deaths: {
      type: Number,
      default: 0
    },
    assists: {
      type: Number,
      default: 0
    },
    headshots: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number, // percentage
      default: 0
    },
    highestScore: {
      type: Number,
      default: 0
    },
    gamesPlayed: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number, // percentage
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    experiencePoints: {
      type: Number,
      default: 0
    },
    rank: {
      type: String,
      default: ''
    }
  },
  // For game-specific stats that don't fit into the common model
  gameSpecificStats: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // For tracking historical stats
  history: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      stats: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isManuallyEntered: {
    type: Boolean,
    default: false
  },
  dataSource: {
    type: String,
    enum: ['steam', 'playstation', 'xbox', 'manual', 'api'],
    default: 'manual'
  }
});

// Create compound index for faster lookups
GameStatsSchema.index({ user: 1, game: 1, platform: 1 }, { unique: true });

// Pre-save hook to update timestamps
GameStatsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GameStats', GameStatsSchema);