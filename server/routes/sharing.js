const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// @route   POST api/sharing/achievement
// @desc    Share an achievement
// @access  Private
router.post('/achievement', auth, async (req, res) => {
  try {
    const { achievementId, achievementName, gameName, platform, message } = req.body;
    
    // Log the sharing activity
    console.log(`Achievement shared: ${achievementName} from ${gameName} on ${platform}`);
    
    // In a production app, we would save this to the database
    // Create a share record 
    const shareData = {
      id: mongoose.Types.ObjectId(),
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      achievementName, 
      gameName,
      platform,
      message,
      shareUrl: `https://gamevault.com/share/${Math.floor(Math.random() * 1000000)}`
    };
    
    // Return success with share data
    res.json({
      success: true,
      shareData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sharing/statistics
// @desc    Get sharing statistics for a user
// @access  Private
router.get('/statistics', auth, async (req, res) => {
  try {
    // In a production app, we would fetch this from the database
    // For now, return mock data
    res.json({
      success: true,
      statistics: {
        totalShares: 12,
        platformBreakdown: {
          twitter: 5,
          facebook: 3,
          discord: 2,
          reddit: 2
        },
        mostSharedAchievements: [
          { name: 'Victory Royale', game: 'Fortnite', count: 3 },
          { name: 'Demolition Expert', game: 'Rocket League', count: 2 },
          { name: 'Sharpshooter', game: 'Call of Duty: Warzone', count: 2 }
        ]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;