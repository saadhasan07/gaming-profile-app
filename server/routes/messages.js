const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Friendship = require('../models/Friendship');

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for the current user
 * @access  Private
 */
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate({
      path: 'participants',
      select: 'name username profileImage isOnline status'
    })
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt read'
    })
    .sort({ updatedAt: -1 });

    // Format the conversations for the client
    const formattedConversations = conversations.map(conv => {
      // For 1-1 chats, get the other participant
      let otherParticipant = null;
      if (!conv.isGroupChat) {
        otherParticipant = conv.participants.find(
          p => p._id.toString() !== req.user.id
        );
      }

      // Get unread count for current user
      const unreadCount = conv.unreadCount.get(req.user.id) || 0;

      return {
        _id: conv._id,
        participants: conv.participants,
        lastMessage: conv.lastMessage,
        isGroupChat: conv.isGroupChat,
        groupName: conv.groupName,
        groupAdmin: conv.groupAdmin,
        otherParticipant,
        unreadCount,
        updatedAt: conv.updatedAt
      };
    });

    res.json({
      success: true,
      count: formattedConversations.length,
      data: formattedConversations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get or create a conversation with a user
 * @access  Private
 */
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    // Check if user exists
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is trying to message themselves
    if (req.user.id === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' });
    }

    // Check if they are friends (unless one is an admin)
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== 'admin' && otherUser.role !== 'admin') {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user.id, recipient: req.params.userId },
          { requester: req.params.userId, recipient: req.user.id }
        ],
        status: 'accepted'
      });

      if (!friendship) {
        return res.status(403).json({ 
          success: false, 
          message: 'You need to be friends with this user to message them' 
        });
      }
    }

    // Check if they're blocked
    const blocked = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: req.params.userId, status: 'blocked' },
        { requester: req.params.userId, recipient: req.user.id, status: 'blocked' }
      ]
    });

    if (blocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot message this user' 
      });
    }

    // Find an existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, req.params.userId] },
      isGroupChat: false
    })
    .populate({
      path: 'participants',
      select: 'name username profileImage isOnline status'
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, req.params.userId],
        isGroupChat: false,
        unreadCount: { [req.params.userId]: 0 }
      });

      conversation = await Conversation.findById(conversation._id)
        .populate({
          path: 'participants',
          select: 'name username profileImage isOnline status'
        });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/messages/conversation/group
 * @desc    Create a group conversation
 * @access  Private
 */
router.post('/conversation/group', protect, async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least 2 participants are required' 
      });
    }

    // Add current user to participants if not already included
    if (!participants.includes(req.user.id)) {
      participants.push(req.user.id);
    }

    // Check if all participants exist
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return res.status(400).json({ success: false, message: 'One or more users not found' });
    }

    // Create the group conversation
    const conversation = await Conversation.create({
      participants,
      isGroupChat: true,
      groupName: name,
      groupAdmin: req.user.id,
      unreadCount: participants.reduce((acc, userId) => {
        // Initialize unread count to 0 for all participants except the creator
        if (userId !== req.user.id) {
          acc[userId] = 0;
        }
        return acc;
      }, {})
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate({
        path: 'participants',
        select: 'name username profileImage isOnline status'
      });

    res.status(201).json({
      success: true,
      data: populatedConversation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get messages for a conversation
 * @access  Private
 */
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get messages with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'sender',
        select: 'name username profileImage'
      });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: req.params.conversationId,
        recipient: req.user.id,
        read: false
      },
      { read: true, readAt: Date.now() }
    );

    // Reset unread count for this user
    const unreadCountUpdate = {};
    unreadCountUpdate[`unreadCount.${req.user.id}`] = 0;
    await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { $set: unreadCountUpdate }
    );

    const count = await Message.countDocuments({ conversation: req.params.conversationId });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: messages.reverse() // Send messages in chronological order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/messages/:conversationId
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post('/:conversationId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Create the message
    const message = await Message.create({
      sender: req.user.id,
      content,
      conversation: req.params.conversationId
    });

    // For 1-1 conversations, set the recipient
    if (!conversation.isGroupChat) {
      const recipient = conversation.participants.find(
        p => p.toString() !== req.user.id
      );
      message.recipient = recipient;
      await message.save();
    } else {
      // For group chats, each participant except the sender is a recipient
      // This is handled by the frontend
    }

    // Update conversation with last message and increment unread counts
    const updates = { lastMessage: message._id, updatedAt: Date.now() };
    
    // Increment unread count for all participants except the sender
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        const key = `unreadCount.${participantId}`;
        updates[key] = (conversation.unreadCount.get(participantId.toString()) || 0) + 1;
      }
    });

    await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { $set: updates }
    );

    // Populate sender info
    const populatedMessage = await Message.findById(message._id).populate({
      path: 'sender',
      select: 'name username profileImage'
    });

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if this is the last message in the conversation
    const conversation = await Conversation.findById(message.conversation);
    
    if (conversation.lastMessage && 
        conversation.lastMessage.toString() === message._id.toString()) {
      // Find the new last message
      const newLastMessage = await Message.findOne({
        conversation: message.conversation,
        _id: { $ne: message._id }
      }).sort({ createdAt: -1 });

      // Update the conversation
      if (newLastMessage) {
        conversation.lastMessage = newLastMessage._id;
      } else {
        conversation.lastMessage = null;
      }
      
      await conversation.save();
    }

    // Delete the message
    await message.remove();

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;