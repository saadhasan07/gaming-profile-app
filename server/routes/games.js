const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');

const Game = require('../models/Game');
const GameStats = require('../models/GameStats');

/**
 * @route   GET /api/games
 * @desc    Get all games with filtering, sorting, and pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      search,
      genre,
      platform,
      sort = 'rating',
      order = 'desc',
      limit = 10,
      page = 1,
      featured,
      popular,
      trending
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (genre) {
      query.genres = genre;
    }
    
    if (platform) {
      query.platforms = platform;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    if (trending === 'true') {
      query.isTrending = true;
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Execute query
    const games = await Game.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name slug description coverImage platforms genres rating totalPlayers');

    // Get total count
    const total = await Game.countDocuments(query);

    res.json({
      success: true,
      count: games.length,
      total,
      totalPages: Math.ceil(total / limit),
      page: parseInt(page),
      data: games
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/games/:slug
 * @desc    Get a game by slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const game = await Game.findOne({ slug: req.params.slug });
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    res.json({
      success: true,
      data: game
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/games
 * @desc    Create a new game
 * @access  Admin
 */
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      releaseDate,
      coverImage,
      bannerImage,
      screenshots,
      genres,
      platforms,
      developer,
      publisher,
      achievements,
      platformIds,
      isPopular,
      isFeatured,
      isTrending
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Game name is required' });
    }

    // Check if game already exists
    const existingGame = await Game.findOne({ name });
    if (existingGame) {
      return res.status(400).json({ success: false, message: 'Game already exists' });
    }

    // Create new game
    const game = await Game.create({
      name,
      description,
      releaseDate,
      coverImage,
      bannerImage,
      screenshots,
      genres,
      platforms,
      developer,
      publisher,
      achievements,
      platformIds,
      isPopular,
      isFeatured,
      isTrending
    });

    res.status(201).json({
      success: true,
      data: game
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/games/:id
 * @desc    Update a game
 * @access  Admin
 */
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    // Find the game
    let game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Update game
    game = await Game.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: game
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/games/:id
 * @desc    Delete a game
 * @access  Admin
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    // Find the game
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Delete game stats associated with this game
    await GameStats.deleteMany({ game: game.name });

    // Delete the game
    await game.remove();

    res.json({
      success: true,
      message: 'Game deleted'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/games/:id/achievements
 * @desc    Get all achievements for a game
 * @access  Public
 */
router.get('/:id/achievements', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).select('achievements');
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    res.json({
      success: true,
      count: game.achievements.length,
      data: game.achievements
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/games/:id/achievements
 * @desc    Add achievements to a game
 * @access  Admin
 */
router.post('/:id/achievements', protect, isAdmin, async (req, res) => {
  try {
    const { achievements } = req.body;
    
    if (!achievements || !Array.isArray(achievements)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Achievements array is required' 
      });
    }

    // Find the game
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Add achievements
    achievements.forEach(achievement => {
      if (!achievement.name) {
        return;
      }

      // Check if achievement already exists
      const existingIndex = game.achievements.findIndex(
        a => a.name === achievement.name
      );

      if (existingIndex >= 0) {
        // Update existing achievement
        game.achievements[existingIndex] = {
          ...game.achievements[existingIndex].toObject(),
          ...achievement
        };
      } else {
        // Add new achievement
        game.achievements.push(achievement);
      }
    });

    await game.save();

    res.json({
      success: true,
      count: game.achievements.length,
      data: game.achievements
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/games/genres
 * @desc    Get all unique genres
 * @access  Public
 */
router.get('/genres', async (req, res) => {
  try {
    const genres = await Game.distinct('genres');
    
    res.json({
      success: true,
      count: genres.length,
      data: genres
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/games/platforms
 * @desc    Get all unique platforms
 * @access  Public
 */
router.get('/platforms', async (req, res) => {
  try {
    const platforms = await Game.distinct('platforms');
    
    res.json({
      success: true,
      count: platforms.length,
      data: platforms
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/games/trending
 * @desc    Get trending games
 * @access  Public
 */
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const games = await Game.find({ isTrending: true })
      .select('name slug coverImage rating')
      .limit(limit);
    
    res.json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;