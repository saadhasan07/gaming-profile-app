const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot be more than 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  displayName: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  profileImage: {
    type: String,
    default: 'default-avatar.png'
  },
  bannerImage: {
    type: String,
    default: 'default-banner.jpg'
  },
  location: {
    type: String,
    trim: true
  },
  social: {
    twitter: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    twitch: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    discord: {
      type: String,
      trim: true
    }
  },
  connectedAccounts: {
    steam: {
      id: String,
      connected: {
        type: Boolean,
        default: false
      }
    },
    xbox: {
      id: String,
      connected: {
        type: Boolean,
        default: false
      }
    },
    playstation: {
      id: String,
      connected: {
        type: Boolean,
        default: false
      }
    },
    nintendo: {
      id: String,
      connected: {
        type: Boolean,
        default: false
      }
    },
    battlenet: {
      id: String,
      connected: {
        type: Boolean,
        default: false
      }
    },
    epic: {
      id: String,
      connected: {
        type: Boolean,
        default: false
      }
    },
    riot: {
      id: String,
      connected: {
        type: Boolean,
        default: false
      }
    }
  },
  favoriteGames: [{
    name: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['pc', 'playstation', 'xbox', 'nintendo', 'mobile', 'other'],
      default: 'pc'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  achievements: [{
    game: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    iconUrl: String,
    unlockedDate: {
      type: Date,
      default: Date.now
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    isShared: {
      type: Boolean,
      default: false
    }
  }],
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  theme: {
    primaryColor: {
      type: String,
      default: '#6C5CE7' // Default neon purple
    },
    secondaryColor: {
      type: String,
      default: '#00F260' // Default neon green
    },
    bgColor: {
      type: String,
      default: '#191A2A' // Default dark theme background
    },
    accentColor: {
      type: String,
      default: '#FD7272' // Default accent color
    },
    font: {
      type: String,
      enum: ['default', 'roboto', 'poppins', 'montserrat', 'sourcecode', 'pressstart', 'orbitron'],
      default: 'default'
    },
    uiStyle: {
      type: String,
      enum: ['default', 'neon', 'cyberpunk', 'retro', 'minimal', 'futuristic'],
      default: 'neon'
    },
    darkMode: {
      type: Boolean,
      default: true
    },
    customCss: {
      type: String,
      default: ''
    },
    borderStyle: {
      type: String,
      enum: ['default', 'rounded', 'sharp', 'glowing', 'pixelated'],
      default: 'glowing'
    },
    animationLevel: {
      type: String,
      enum: ['none', 'minimal', 'moderate', 'high'],
      default: 'moderate'
    }
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    showPlaytime: {
      type: Boolean,
      default: true
    },
    autoShareAchievements: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    allowFriendRequests: {
      type: Boolean,
      default: true
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    statsVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // New fields for authentication
  googleId: String,
  facebookId: String,
  twitterId: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create indexes for frequently queried fields
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ facebookId: 1 });
UserSchema.index({ isOnline: 1 });

module.exports = mongoose.model('User', UserSchema);