const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const GameEvent = require('../models/GameEvent');
const User = require('../models/User');
const Friendship = require('../models/Friendship');

/**
 * @route   GET /api/events
 * @desc    Get all events with filtering
 * @access  Public/Private (different results based on auth)
 */
router.get('/', async (req, res) => {
  try {
    const {
      game,
      startDate,
      endDate,
      eventType,
      eventStatus,
      isPublic,
      creator,
      limit = 20,
      page = 1
    } = req.query;

    // Build query
    const query = {};

    if (game) {
      query.game = game;
    }

    if (startDate) {
      query.startTime = { $gte: new Date(startDate) };
    }

    if (endDate) {
      query.endTime = { ...query.endTime, $lte: new Date(endDate) };
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (eventStatus) {
      query.eventStatus = eventStatus;
    }

    if (isPublic === 'true') {
      query.isPublic = true;
    }

    if (creator) {
      query.creator = creator;
    }

    // If user is authenticated, include private events they're part of
    if (req.user) {
      // If isPublic is explicitly set to false, only show private events
      if (isPublic === 'false') {
        query.isPublic = false;
        query.$or = [
          { creator: req.user.id },
          { 'participants.user': req.user.id }
        ];
      } else if (isPublic !== 'true') {
        // If isPublic is not specified, show both public and private events they're part of
        query.$or = [
          { isPublic: true },
          { 
            isPublic: false,
            $or: [
              { creator: req.user.id },
              { 'participants.user': req.user.id }
            ]
          }
        ];
      }
    } else {
      // If not authenticated, only show public events
      query.isPublic = true;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get events
    const events = await GameEvent.find(query)
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await GameEvent.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      data: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get a single event
 * @access  Public/Private (based on event privacy)
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await GameEvent.findById(req.params.id)
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user can view this event
    if (!event.isPublic && (!req.user || 
        (req.user.id !== event.creator._id.toString() && 
         !event.participants.some(p => p.user._id.toString() === req.user.id)))) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this event' });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      creator: req.user.id
    };

    // Validate required fields
    if (!eventData.title || !eventData.game || !eventData.startTime || !eventData.endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, game, start time, and end time are required' 
      });
    }

    // Create event
    const event = await GameEvent.create(eventData);

    // Add creator as a participant
    event.participants.push({
      user: req.user.id,
      status: 'going',
      joinedAt: Date.now()
    });

    await event.save();

    // Return populated event
    const populatedEvent = await GameEvent.findById(event._id)
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage');

    res.status(201).json({
      success: true,
      data: populatedEvent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (creator only)
 */
router.put('/:id', protect, async (req, res) => {
  try {
    let event = await GameEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    // Prevent updating certain fields
    delete req.body.creator;
    delete req.body.participants;
    delete req.body.createdAt;

    // Update event
    event = await GameEvent.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage');

    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (creator only)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await GameEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.remove();

    res.json({
      success: true,
      message: 'Event deleted'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/events/:id/join
 * @desc    Join an event
 * @access  Private
 */
router.post('/:id/join', protect, async (req, res) => {
  try {
    const { status = 'going' } = req.body;
    const event = await GameEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user can join
    if (!event.isPublic) {
      // Check if creator is friends with user for private events
      const friendship = await Friendship.findOne({
        $or: [
          { requester: event.creator, recipient: req.user.id },
          { requester: req.user.id, recipient: event.creator }
        ],
        status: 'accepted'
      });

      if (!friendship && event.creator.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only join private events if you are friends with the creator' 
        });
      }
    }

    // Check if user is already a participant
    const participantIndex = event.participants.findIndex(
      p => p.user.toString() === req.user.id
    );

    if (participantIndex !== -1) {
      // Update existing participant status
      event.participants[participantIndex].status = status;
    } else {
      // Check if max participants reached
      if (event.maxParticipants > 0 && 
          event.participants.length >= event.maxParticipants) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event has reached maximum number of participants' 
        });
      }

      // Add user as a participant
      event.participants.push({
        user: req.user.id,
        status,
        joinedAt: Date.now()
      });
    }

    await event.save();

    // Return populated event
    const populatedEvent = await GameEvent.findById(event._id)
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage');

    res.json({
      success: true,
      data: populatedEvent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/events/:id/leave
 * @desc    Leave an event
 * @access  Private
 */
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const event = await GameEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.creator.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Creator cannot leave event. Delete it instead.' 
      });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      p => p.user.toString() !== req.user.id
    );

    await event.save();

    // Return populated event
    const populatedEvent = await GameEvent.findById(event._id)
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage');

    res.json({
      success: true,
      data: populatedEvent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/events/:id/invite
 * @desc    Invite users to an event
 * @access  Private (creator or participants)
 */
router.post('/:id/invite', protect, async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Users array is required' 
      });
    }

    const event = await GameEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is a participant or creator
    const isParticipant = event.participants.some(
      p => p.user.toString() === req.user.id
    );
    
    if (!isParticipant && event.creator.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only participants or the creator can invite others' 
      });
    }

    // Add invited users
    const existingParticipantIds = event.participants.map(p => p.user.toString());
    const newInvites = [];

    for (const userId of users) {
      // Skip if user is already a participant
      if (existingParticipantIds.includes(userId)) {
        continue;
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        continue;
      }

      // Add user as invited participant
      event.participants.push({
        user: userId,
        status: 'invited',
        joinedAt: Date.now()
      });

      newInvites.push(userId);
    }

    // Check if max participants would be exceeded
    if (event.maxParticipants > 0 && 
        event.participants.length > event.maxParticipants) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot invite more users than the maximum participants allowed' 
      });
    }

    await event.save();

    // Return populated event
    const populatedEvent = await GameEvent.findById(event._id)
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage');

    res.json({
      success: true,
      message: `${newInvites.length} users invited`,
      data: populatedEvent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/events/user/:userId
 * @desc    Get all events for a user
 * @access  Public/Private (based on event privacy)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { status, upcoming = 'true', limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = {
      $or: [
        { creator: req.params.userId },
        { 'participants.user': req.params.userId }
      ]
    };

    // If not authenticated or not the requested user, only show public events
    if (!req.user || req.user.id !== req.params.userId) {
      query.isPublic = true;
    }

    // Filter by participant status
    if (status) {
      query['participants.status'] = status;
    }

    // Filter upcoming or past events
    if (upcoming === 'true') {
      query.startTime = { $gte: new Date() };
    } else {
      query.endTime = { $lt: new Date() };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get events
    const events = await GameEvent.find(query)
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage')
      .sort(upcoming === 'true' ? { startTime: 1 } : { endTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await GameEvent.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      data: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/events/game/:game
 * @desc    Get all events for a specific game
 * @access  Public (only public events)
 */
router.get('/game/:game', async (req, res) => {
  try {
    const { upcoming = 'true', limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = {
      game: req.params.game,
      isPublic: true
    };

    // Filter upcoming or past events
    if (upcoming === 'true') {
      query.startTime = { $gte: new Date() };
    } else {
      query.endTime = { $lt: new Date() };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get events
    const events = await GameEvent.find(query)
      .populate('creator', 'username profileImage')
      .populate('participants.user', 'username profileImage')
      .sort(upcoming === 'true' ? { startTime: 1 } : { endTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await GameEvent.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      data: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;