const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// Environment variables should be set
// GOOGLE_CLIENT_ID 
// FACEBOOK_APP_ID
// FACEBOOK_APP_SECRET

// Google Auth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST api/auth/google
 * @desc    Login or Register user with Google
 * @access  Public
 */
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have googleId, update it
      if (!user.googleId) {
        user.googleId = googleId;
        user.profileImage = user.profileImage || picture;
        await user.save();
      }
    } else {
      // Create new user
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = new User({
        name,
        email,
        username,
        googleId,
        profileImage: picture,
        password: Math.random().toString(36).slice(-16), // Random password
        verified: true // Google accounts are already verified
      });

      await user.save();
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.json({ token });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * @route   POST api/auth/facebook
 * @desc    Login or Register user with Facebook
 * @access  Public
 */
router.post('/facebook', async (req, res) => {
  const { accessToken, userID } = req.body;

  try {
    // Verify the Facebook access token
    const fbResponse = await axios.get(
      `https://graph.facebook.com/v13.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!fbResponse.data || !fbResponse.data.id) {
      return res.status(400).json({ msg: 'Invalid Facebook token' });
    }

    const { id: facebookId, name, email, picture } = fbResponse.data;

    // Check if user exists by Facebook ID or email
    let user = await User.findOne({ 
      $or: [{ facebookId }, { email }] 
    });

    if (user) {
      // If user exists but doesn't have facebookId, update it
      if (!user.facebookId) {
        user.facebookId = facebookId;
        user.profileImage = user.profileImage || picture.data.url;
        await user.save();
      }
    } else {
      // Create new user
      // If email is not provided by Facebook, generate a placeholder
      const userEmail = email || `fb_${facebookId}@placeholder.com`;
      const username = (email ? email.split('@')[0] : `user_${facebookId}`) + 
                      Math.floor(Math.random() * 1000);
      
      user = new User({
        name,
        email: userEmail,
        username,
        facebookId,
        profileImage: picture.data.url,
        password: Math.random().toString(36).slice(-16), // Random password
        verified: true // Facebook accounts are already verified
      });

      await user.save();
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.json({ token });
  } catch (err) {
    console.error('Facebook auth error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;