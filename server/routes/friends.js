const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

const User = require('../models/User');
const Friendship = require('../models/Friendship');

/**
 * @route   GET /api/friends
 * @desc    Get all friends for the logged in user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    // Get all accepted friendships where the user is either requester or recipient
    const friendships = await Friendship.find({
      $and: [
        { $or: [{ requester: req.user.id }, { recipient: req.user.id }] },
        { status: 'accepted' }
      ]
    }).populate('requester recipient', 'name username profileImage isOnline status lastActive currentGame');

    // Extract the friend from each friendship (the other user)
    const friends = friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === req.user.id
        ? friendship.recipient
        : friendship.requester;
      
      return {
        _id: friend._id,
        name: friend.name,
        username: friend.username,
        profileImage: friend.profileImage,
        isOnline: friend.isOnline,
        status: friend.status,
        lastActive: friend.lastActive,
        currentGame: friend.currentGame,
        friendshipId: friendship._id
      };
    });

    res.json({ success: true, count: friends.length, data: friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/friends/requests
 * @desc    Get all friend requests for the logged in user
 * @access  Private
 */
router.get('/requests', protect, async (req, res) => {
  try {
    // Get all pending friend requests where user is the recipient
    const friendRequests = await Friendship.find({
      recipient: req.user.id,
      status: 'pending'
    }).populate('requester', 'name username profileImage');

    res.json({
      success: true,
      count: friendRequests.length,
      data: friendRequests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/friends/sent
 * @desc    Get all sent friend requests by the logged in user
 * @access  Private
 */
router.get('/sent', protect, async (req, res) => {
  try {
    // Get all pending friend requests where user is the requester
    const sentRequests = await Friendship.find({
      requester: req.user.id,
      status: 'pending'
    }).populate('recipient', 'name username profileImage');

    res.json({
      success: true,
      count: sentRequests.length,
      data: sentRequests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/friends/request/:userId
 * @desc    Send a friend request to a user
 * @access  Private
 */
router.post('/request/:userId', protect, async (req, res) => {
  try {
    // Check if user exists
    const recipient = await User.findById(req.params.userId);
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is trying to add themselves
    if (req.user.id === req.params.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot add yourself as a friend' 
      });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: req.params.userId },
        { requester: req.params.userId, recipient: req.user.id }
      ]
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'pending') {
        if (existingFriendship.requester.toString() === req.user.id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Friend request already sent' 
          });
        } else {
          // If user is the recipient of a pending request, accept it
          existingFriendship.status = 'accepted';
          await existingFriendship.save();
          return res.json({ 
            success: true, 
            message: 'Friend request accepted', 
            data: existingFriendship 
          });
        }
      } else if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ 
          success: false, 
          message: 'Already friends with this user' 
        });
      } else if (existingFriendship.status === 'blocked') {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot send friend request to this user' 
        });
      }
    }

    // Create a new friendship
    const friendship = await Friendship.create({
      requester: req.user.id,
      recipient: req.params.userId,
      status: 'pending'
    });

    // Update both users' friend counts
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { friendCount: 1 } }
    );

    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: friendship
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/friends/accept/:requestId
 * @desc    Accept a friend request
 * @access  Private
 */
router.put('/accept/:requestId', protect, async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.requestId);

    if (!friendship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Friend request not found' 
      });
    }

    // Check if user is the recipient of the request
    if (friendship.recipient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Check if request is already accepted
    if (friendship.status === 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Friend request already accepted' 
      });
    }

    // Update friendship status
    friendship.status = 'accepted';
    await friendship.save();

    // Update recipient's friend count
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { friendCount: 1 } }
    );

    res.json({
      success: true,
      message: 'Friend request accepted',
      data: friendship
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/friends/reject/:requestId
 * @desc    Reject a friend request
 * @access  Private
 */
router.put('/reject/:requestId', protect, async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.requestId);

    if (!friendship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Friend request not found' 
      });
    }

    // Check if user is the recipient of the request
    if (friendship.recipient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Update friendship status
    friendship.status = 'rejected';
    await friendship.save();

    res.json({
      success: true,
      message: 'Friend request rejected',
      data: friendship
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/friends/:friendshipId
 * @desc    Remove a friend
 * @access  Private
 */
router.delete('/:friendshipId', protect, async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Friendship not found' 
      });
    }

    // Check if user is part of the friendship
    if (friendship.requester.toString() !== req.user.id && 
        friendship.recipient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Delete the friendship
    await friendship.remove();

    // Update friend counts for both users
    await User.findByIdAndUpdate(
      friendship.requester,
      { $inc: { friendCount: -1 } }
    );
    
    await User.findByIdAndUpdate(
      friendship.recipient,
      { $inc: { friendCount: -1 } }
    );

    res.json({
      success: true,
      message: 'Friend removed'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/friends/block/:userId
 * @desc    Block a user
 * @access  Private
 */
router.put('/block/:userId', protect, async (req, res) => {
  try {
    // Check if user exists
    const userToBlock = await User.findById(req.params.userId);
    if (!userToBlock) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if there's an existing friendship
    let friendship = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: req.params.userId },
        { requester: req.params.userId, recipient: req.user.id }
      ]
    });

    if (friendship) {
      // If already blocked, return
      if (friendship.status === 'blocked' && 
          friendship.requester.toString() === req.user.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already blocked' 
        });
      }

      // Update the friendship - make current user the requester and target the recipient
      if (friendship.requester.toString() !== req.user.id) {
        // Swap requester and recipient
        const temp = friendship.requester;
        friendship.requester = friendship.recipient;
        friendship.recipient = temp;
      }

      friendship.status = 'blocked';
      await friendship.save();
    } else {
      // Create a new blocked relationship
      friendship = await Friendship.create({
        requester: req.user.id,
        recipient: req.params.userId,
        status: 'blocked'
      });
    }

    res.json({
      success: true,
      message: 'User blocked',
      data: friendship
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/friends/unblock/:userId
 * @desc    Unblock a user
 * @access  Private
 */
router.put('/unblock/:userId', protect, async (req, res) => {
  try {
    // Find the blocked relationship
    const friendship = await Friendship.findOne({
      requester: req.user.id,
      recipient: req.params.userId,
      status: 'blocked'
    });

    if (!friendship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blocked relationship not found' 
      });
    }

    // Delete the relationship
    await friendship.remove();

    res.json({
      success: true,
      message: 'User unblocked'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/friends/suggested
 * @desc    Get suggested friends based on common games and platforms
 * @access  Private
 */
router.get('/suggested', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's existing friends and blocked users
    const existingRelationships = await Friendship.find({
      $or: [
        { requester: req.user.id },
        { recipient: req.user.id }
      ]
    });

    // Create a list of user IDs to exclude (self, friends, blocked)
    const excludeIds = existingRelationships.map(rel => {
      return rel.requester.toString() === req.user.id 
        ? rel.recipient.toString() 
        : rel.requester.toString();
    });
    excludeIds.push(req.user.id); // exclude self

    // Find users with similar interests
    const suggestedUsers = await User.find({
      _id: { $nin: excludeIds },
      $or: [
        { favoriteGames: { $in: currentUser.favoriteGames } },
        { preferredPlatforms: { $in: currentUser.preferredPlatforms } }
      ]
    })
    .select('name username profileImage isOnline status lastActive favoriteGames preferredPlatforms')
    .limit(10);

    res.json({ 
      success: true, 
      count: suggestedUsers.length, 
      data: suggestedUsers 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;