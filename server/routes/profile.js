const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('../models/User');
const GameStats = require('../models/GameStats');
const Game = require('../models/Game');
const Friendship = require('../models/Friendship');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../client/public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, gif)'));
    }
  }
});

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/profile/:username
 * @desc    Get profile by username
 * @access  Public (limited data) / Private (full data for friends)
 */
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -email -emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check visibility settings
    if (user.preferences.profileVisibility === 'private' && (!req.user || req.user.id !== user._id.toString())) {
      return res.status(403).json({ success: false, message: 'This profile is private' });
    }

    // If profile is set to 'friends' visibility, check friendship
    if (user.preferences.profileVisibility === 'friends' && req.user && req.user.id !== user._id.toString()) {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user.id, recipient: user._id, status: 'accepted' },
          { requester: user._id, recipient: req.user.id, status: 'accepted' }
        ]
      });

      if (!friendship) {
        return res.status(403).json({ success: false, message: 'This profile is only visible to friends' });
      }
    }

    // Get game stats if allowed
    let stats = [];
    if (
      user.preferences.statsVisibility === 'public' || 
      (user.preferences.statsVisibility === 'friends' && req.user && (
        req.user.id === user._id.toString() || 
        await Friendship.findOne({
          $or: [
            { requester: req.user.id, recipient: user._id, status: 'accepted' },
            { requester: user._id, recipient: req.user.id, status: 'accepted' }
          ]
        })
      ))
    ) {
      stats = await GameStats.find({ user: user._id }).select('-gameSpecificStats -history');
    }

    // Get friendship status if authenticated
    let friendshipStatus = null;
    if (req.user && req.user.id !== user._id.toString()) {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user.id, recipient: user._id },
          { requester: user._id, recipient: req.user.id }
        ]
      });

      if (friendship) {
        friendshipStatus = {
          status: friendship.status,
          since: friendship.createdAt,
          // Only show if current user is the requester or the status is accepted
          isPending: friendship.status === 'pending' && friendship.requester.toString() === req.user.id
        };
      }
    }

    // Check if blocked
    let isBlocked = false;
    if (req.user && req.user.id !== user._id.toString()) {
      isBlocked = user.blockedUsers.some(id => id.toString() === req.user.id);
    }

    // Return appropriate data
    const responseData = {
      ...user.toObject(),
      gameStats: stats,
      friendship: friendshipStatus,
      isBlocked
    };

    // Remove sensitive data if not the profile owner
    if (!req.user || req.user.id !== user._id.toString()) {
      delete responseData.blockedUsers;
      delete responseData.preferences;
      delete responseData.role;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', protect, async (req, res) => {
  try {
    const {
      displayName,
      bio,
      location,
      social,
      favoriteGames,
      preferences
    } = req.body;

    // Build profile object
    const profileFields = {};
    if (displayName) profileFields.displayName = displayName;
    if (bio) profileFields.bio = bio;
    if (location) profileFields.location = location;
    if (social) profileFields.social = social;
    if (favoriteGames) profileFields.favoriteGames = favoriteGames;
    if (preferences) profileFields.preferences = preferences;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/profile/theme
 * @desc    Update user theme
 * @access  Private
 */
router.put('/theme', protect, async (req, res) => {
  try {
    const {
      primaryColor,
      secondaryColor,
      bgColor,
      accentColor,
      font,
      uiStyle,
      darkMode,
      customCss,
      borderStyle,
      animationLevel
    } = req.body;

    // Build theme object
    const themeFields = {};
    if (primaryColor) themeFields['theme.primaryColor'] = primaryColor;
    if (secondaryColor) themeFields['theme.secondaryColor'] = secondaryColor;
    if (bgColor) themeFields['theme.bgColor'] = bgColor;
    if (accentColor) themeFields['theme.accentColor'] = accentColor;
    if (font) themeFields['theme.font'] = font;
    if (uiStyle) themeFields['theme.uiStyle'] = uiStyle;
    if (darkMode !== undefined) themeFields['theme.darkMode'] = darkMode;
    if (customCss !== undefined) themeFields['theme.customCss'] = customCss;
    if (borderStyle) themeFields['theme.borderStyle'] = borderStyle;
    if (animationLevel) themeFields['theme.animationLevel'] = animationLevel;

    // Update user theme
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: themeFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user.theme
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/profile/upload/avatar
 * @desc    Upload profile avatar
 * @access  Private
 */
router.post('/upload/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Update user profile image
    const profileImage = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profileImage } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: {
        profileImage,
        user
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/**
 * @route   POST /api/profile/upload/banner
 * @desc    Upload profile banner
 * @access  Private
 */
router.post('/upload/banner', protect, upload.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Update user banner image
    const bannerImage = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { bannerImage } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: {
        bannerImage,
        user
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/**
 * @route   PUT /api/profile/connected-accounts
 * @desc    Update connected gaming accounts
 * @access  Private
 */
router.put('/connected-accounts', protect, async (req, res) => {
  try {
    const { platform, id } = req.body;
    
    if (!platform || !id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform and ID are required' 
      });
    }

    // Check if platform is valid
    const validPlatforms = ['steam', 'xbox', 'playstation', 'nintendo', 'battlenet', 'epic', 'riot'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid platform' 
      });
    }

    // Update connected account
    const updateField = {};
    updateField[`connectedAccounts.${platform}.id`] = id;
    updateField[`connectedAccounts.${platform}.connected`] = true;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateField },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user.connectedAccounts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/profile/connected-accounts/:platform
 * @desc    Remove a connected gaming account
 * @access  Private
 */
router.delete('/connected-accounts/:platform', protect, async (req, res) => {
  try {
    const { platform } = req.params;
    
    // Check if platform is valid
    const validPlatforms = ['steam', 'xbox', 'playstation', 'nintendo', 'battlenet', 'epic', 'riot'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid platform' 
      });
    }

    // Update connected account
    const updateField = {};
    updateField[`connectedAccounts.${platform}.id`] = '';
    updateField[`connectedAccounts.${platform}.connected`] = false;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateField },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user.connectedAccounts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/profile/favorite-games
 * @desc    Update favorite games
 * @access  Private
 */
router.put('/favorite-games', protect, async (req, res) => {
  try {
    const { games } = req.body;
    
    if (!games || !Array.isArray(games)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Games array is required' 
      });
    }

    // Ensure only one primary game
    let hasPrimary = false;
    games.forEach(game => {
      if (game.isPrimary) {
        if (hasPrimary) {
          game.isPrimary = false;
        } else {
          hasPrimary = true;
        }
      }
    });

    // Update user's favorite games
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { favoriteGames: games } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user.favoriteGames
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/profile/block/:userId
 * @desc    Block a user
 * @access  Private
 */
router.post('/block/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already blocked
    const user = await User.findById(req.user.id);
    if (user.blockedUsers.some(id => id.toString() === userId)) {
      return res.status(400).json({ success: false, message: 'User already blocked' });
    }

    // Block user
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { blockedUsers: userId } }
    );

    // Remove any existing friendship
    await Friendship.findOneAndDelete({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id }
      ]
    });

    res.json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/profile/block/:userId
 * @desc    Unblock a user
 * @access  Private
 */
router.delete('/block/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Unblock user
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { blockedUsers: userId } }
    );

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;