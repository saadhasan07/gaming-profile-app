const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const GameStats = require('../models/GameStats');
const User = require('../models/User');

// @route   GET api/leaderboard
// @desc    Get global leaderboard (with optional game filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Filter by game if provided
    if (req.query.game) {
      query.game = req.query.game;
    }
    
    // Filter by platform if provided
    if (req.query.platform) {
      query.platform = req.query.platform;
    }
    
    // Determine sort field
    let sortField = {};
    const sortBy = req.query.sortBy || 'wins';
    
    // Set default sorting based on the requested stat
    switch (sortBy) {
      case 'wins':
        sortField = { 'stats.wins': -1 };
        break;
      case 'kd':
        sortField = { 'stats.kdRatio': -1 };
        break;
      case 'accuracy':
        sortField = { 'stats.accuracy': -1 };
        break;
      case 'timePlayed':
        sortField = { 'stats.timePlayed': -1 };
        break;
      case 'headshots':
        sortField = { 'stats.headshots': -1 };
        break;
      default:
        sortField = { 'stats.wins': -1 };
    }
    
    // Set pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Find game stats sorted by specified field
    const totalResults = await GameStats.countDocuments(query);
    
    const gameStats = await GameStats.find(query)
      .sort(sortField)
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: 'user',
        select: 'username profileImage'
      });
    
    // Format the response data
    const formattedStats = await Promise.all(gameStats.map(async (stat, index) => {
      return {
        rank: startIndex + index + 1,
        playerId: stat.user._id,
        username: stat.user.username,
        profileImage: stat.user.profileImage,
        game: stat.game,
        platform: stat.platform,
        stats: {
          wins: stat.stats.wins || 0,
          kdRatio: stat.stats.kdRatio || 0,
          accuracy: stat.stats.accuracy || 0,
          timePlayed: stat.stats.timePlayed || 0,
          headshots: stat.stats.headshots || 0,
          gamesPlayed: stat.stats.gamesPlayed || 0
        }
      };
    }));
    
    // Create pagination metadata
    const pagination = {
      total: totalResults,
      limit,
      page,
      pages: Math.ceil(totalResults / limit)
    };
    
    res.json({
      success: true,
      count: formattedStats.length,
      pagination,
      data: formattedStats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/leaderboard/games
// @desc    Get list of games available on leaderboard
// @access  Public
router.get('/games', async (req, res) => {
  try {
    // Find distinct games
    const games = await GameStats.distinct('game');
    
    // Count players for each game
    const gamesWithCounts = await Promise.all(
      games.map(async (game) => {
        const count = await GameStats.countDocuments({ game });
        return {
          name: game,
          players: count
        };
      })
    );
    
    res.json({
      success: true,
      count: games.length,
      data: gamesWithCounts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/leaderboard/friends
// @desc    Get leaderboard for user's friends
// @access  Private
router.get('/friends', protect, async (req, res) => {
  try {
    // This is a placeholder for a future feature
    // In a real implementation, you would retrieve the user's friends list
    // and filter game stats by those friends
    
    res.json({
      success: true,
      msg: 'Friends leaderboard feature coming soon',
      data: []
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/leaderboard/rank/:gameId
// @desc    Get a user's rank for a specific game
// @access  Private
router.get('/rank/:game', protect, async (req, res) => {
  try {
    const { game } = req.params;
    const { sortBy = 'wins' } = req.query;
    
    // Determine sort field
    let sortField = {};
    
    // Set default sorting based on the requested stat
    switch (sortBy) {
      case 'wins':
        sortField = { 'stats.wins': -1 };
        break;
      case 'kd':
        sortField = { 'stats.kdRatio': -1 };
        break;
      case 'accuracy':
        sortField = { 'stats.accuracy': -1 };
        break;
      case 'timePlayed':
        sortField = { 'stats.timePlayed': -1 };
        break;
      case 'headshots':
        sortField = { 'stats.headshots': -1 };
        break;
      default:
        sortField = { 'stats.wins': -1 };
    }
    
    // Get all game stats for the specified game, sorted by the requested field
    const allGameStats = await GameStats.find({ game })
      .sort(sortField);
    
    // Find the user's game stat in the array
    const userRankIndex = allGameStats.findIndex(
      (stat) => stat.user.toString() === req.user.id
    );
    
    if (userRankIndex === -1) {
      return res.status(404).json({ msg: 'No stats found for this game' });
    }
    
    // Calculate the user's rank
    const userRank = userRankIndex + 1;
    
    // Get user's game stats
    const userGameStats = await GameStats.findOne({
      user: req.user.id,
      game
    });
    
    res.json({
      success: true,
      data: {
        rank: userRank,
        totalPlayers: allGameStats.length,
        game,
        stats: userGameStats.stats
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;