const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const axios = require('axios');

const GameStats = require('../models/GameStats');
const Game = require('../models/Game');
const User = require('../models/User');

/**
 * @route   GET /api/gamestats
 * @desc    Get all game stats for the logged-in user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const gameStats = await GameStats.find({ user: req.user.id });
    res.json({
      success: true,
      count: gameStats.length,
      data: gameStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/gamestats/:gameId
 * @desc    Get stats for a specific game for the logged-in user
 * @access  Private
 */
router.get('/:gameId', protect, async (req, res) => {
  try {
    const gameStats = await GameStats.findOne({
      user: req.user.id,
      game: req.params.gameId
    });

    if (!gameStats) {
      return res.status(404).json({ success: false, message: 'Game stats not found' });
    }

    res.json({
      success: true,
      data: gameStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/gamestats
 * @desc    Add or update game stats manually
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { game, platform, statistics, gameSpecificStats, achievements } = req.body;

    if (!game || !platform) {
      return res.status(400).json({ success: false, message: 'Game and platform are required' });
    }

    // Check if game exists in our database
    let gameDoc = await Game.findOne({ 
      $or: [
        { name: game },
        { slug: game.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') }
      ]
    });

    // If game doesn't exist, create a basic entry
    if (!gameDoc) {
      gameDoc = await Game.create({
        name: game,
        platforms: [platform]
      });
    }

    // Try to find existing game stats for this user and game
    let gameStats = await GameStats.findOne({
      user: req.user.id,
      game: gameDoc.name,
      platform
    });

    // Update or create game stats
    if (gameStats) {
      // Update existing game stats
      if (statistics) {
        for (const [key, value] of Object.entries(statistics)) {
          gameStats.statistics[key] = value;
        }
      }

      if (gameSpecificStats) {
        for (const [key, value] of Object.entries(gameSpecificStats)) {
          gameStats.gameSpecificStats.set(key, value);
        }
      }

      // Add historical record
      gameStats.history.push({
        date: Date.now(),
        stats: {
          ...statistics,
          ...Object.fromEntries(gameStats.gameSpecificStats)
        }
      });

      // Update achievements if provided
      if (achievements && Array.isArray(achievements)) {
        // Merge achievements
        achievements.forEach(newAchievement => {
          const existingIndex = gameStats.achievements.findIndex(
            a => a.name === newAchievement.name
          );

          if (existingIndex >= 0) {
            // Update existing achievement
            gameStats.achievements[existingIndex] = {
              ...gameStats.achievements[existingIndex].toObject(),
              ...newAchievement
            };
          } else {
            // Add new achievement
            gameStats.achievements.push(newAchievement);
          }
        });
      }

      gameStats.isManuallyEntered = true;
      gameStats.updatedAt = Date.now();
      await gameStats.save();
    } else {
      // Create new game stats
      gameStats = await GameStats.create({
        user: req.user.id,
        game: gameDoc.name,
        platform,
        statistics: statistics || {},
        gameSpecificStats: gameSpecificStats || {},
        achievements: achievements || [],
        isManuallyEntered: true,
        dataSource: 'manual'
      });
    }

    res.status(200).json({
      success: true,
      data: gameStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/gamestats/sync/steam
 * @desc    Sync game stats from Steam
 * @access  Private
 */
router.post('/sync/steam', protect, async (req, res) => {
  try {
    const { steamId } = req.body;
    
    if (!steamId) {
      return res.status(400).json({ success: false, message: 'Steam ID is required' });
    }

    // Check if we have a Steam API key
    if (!process.env.STEAM_API_KEY) {
      return res.status(501).json({ 
        success: false, 
        message: 'Steam API integration is not configured' 
      });
    }

    // Update user's connected accounts
    await User.findByIdAndUpdate(req.user.id, {
      'connectedAccounts.steam.id': steamId,
      'connectedAccounts.steam.connected': true
    });

    // This would be where you'd implement the actual Steam API integration
    // The actual implementation would be more complex and involve multiple API calls
    
    return res.json({
      success: true,
      message: 'Steam account connected successfully',
      data: {
        steamId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/gamestats/leaderboard/:game
 * @desc    Get leaderboard for a specific game
 * @access  Public
 */
router.get('/leaderboard/:game', async (req, res) => {
  try {
    const { game } = req.params;
    const { platform, stat = 'wins', limit = 10 } = req.query;

    // Build query based on parameters
    const query = { game };
    if (platform) {
      query.platform = platform;
    }

    // Find game stats and sort by the requested statistic
    const leaderboard = await GameStats.find(query)
      .select(`user statistics.${stat} gamertag`)
      .populate('user', 'username profileImage')
      .sort({ [`statistics.${stat}`]: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: leaderboard.length,
      data: leaderboard.map(entry => ({
        user: {
          _id: entry.user._id,
          username: entry.user.username,
          profileImage: entry.user.profileImage
        },
        value: entry.statistics[stat] || 0,
        gamertag: entry.gamertag
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/gamestats/achievements/:game
 * @desc    Get achievements for a specific game for the logged-in user
 * @access  Private
 */
router.get('/achievements/:game', protect, async (req, res) => {
  try {
    const { game } = req.params;
    const { platform } = req.query;

    // Build query
    const query = { user: req.user.id, game };
    if (platform) {
      query.platform = platform;
    }

    // Find the game stats document
    const gameStats = await GameStats.findOne(query).select('achievements');

    if (!gameStats) {
      return res.status(404).json({ 
        success: false, 
        message: 'No achievements found for this game' 
      });
    }

    res.json({
      success: true,
      count: gameStats.achievements.length,
      data: gameStats.achievements
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/gamestats/achievements/:game
 * @desc    Add a new achievement
 * @access  Private
 */
router.post('/achievements/:game', protect, async (req, res) => {
  try {
    const { game } = req.params;
    const { platform, achievement } = req.body;

    if (!platform || !achievement || !achievement.name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform and achievement name are required' 
      });
    }

    // Find the game stats document
    const gameStats = await GameStats.findOne({
      user: req.user.id,
      game,
      platform
    });

    if (!gameStats) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game stats not found' 
      });
    }

    // Check if achievement already exists
    const existingIndex = gameStats.achievements.findIndex(
      a => a.name === achievement.name
    );

    if (existingIndex >= 0) {
      // Update existing achievement
      gameStats.achievements[existingIndex] = {
        ...gameStats.achievements[existingIndex].toObject(),
        ...achievement,
        unlockedDate: achievement.unlockedDate || Date.now()
      };
    } else {
      // Add new achievement
      gameStats.achievements.push({
        ...achievement,
        unlockedDate: achievement.unlockedDate || Date.now()
      });
    }

    await gameStats.save();

    res.status(200).json({
      success: true,
      data: gameStats.achievements
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/gamestats/achievements/:game/share/:achievementId
 * @desc    Share an achievement
 * @access  Private
 */
router.post('/achievements/:game/share/:achievementId', protect, async (req, res) => {
  try {
    const { game, achievementId } = req.params;
    const { platform } = req.query;

    // Build query
    const query = { user: req.user.id, game };
    if (platform) {
      query.platform = platform;
    }

    // Find the game stats document
    const gameStats = await GameStats.findOne(query);

    if (!gameStats) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game stats not found' 
      });
    }

    // Find the achievement
    const achievement = gameStats.achievements.id(achievementId);
    if (!achievement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Achievement not found' 
      });
    }

    // Mark as shared
    achievement.isShared = true;
    await gameStats.save();

    res.status(200).json({
      success: true,
      data: achievement
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;