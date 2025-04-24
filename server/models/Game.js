const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  releaseDate: {
    type: Date
  },
  coverImage: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  },
  screenshots: [{
    type: String
  }],
  genres: [{
    type: String,
    trim: true
  }],
  platforms: [{
    type: String,
    enum: ['pc', 'playstation', 'xbox', 'nintendo', 'mobile', 'other']
  }],
  developer: {
    type: String,
    default: ''
  },
  publisher: {
    type: String,
    default: ''
  },
  totalPlayers: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numberOfRatings: {
    type: Number,
    default: 0
  },
  achievements: [{
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
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    rarityPercentage: {
      type: Number,
      default: 0
    }
  }],
  // IDs from different platforms for API integration
  platformIds: {
    steam: String,
    igdb: String,
    playstation: String,
    xbox: String,
    nintendo: String
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
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

// Ensure slug is generated from name
GameSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

// Create indexes for frequently queried fields
GameSchema.index({ name: 1 });
GameSchema.index({ slug: 1 });
GameSchema.index({ genres: 1 });
GameSchema.index({ platforms: 1 });
GameSchema.index({ isPopular: 1 });
GameSchema.index({ isFeatured: 1 });
GameSchema.index({ isTrending: 1 });
GameSchema.index({ releaseDate: -1 });

module.exports = mongoose.model('Game', GameSchema);