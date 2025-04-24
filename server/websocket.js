const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const GameEvent = require('./models/GameEvent');

/**
 * Initialize WebSocket server
 * @param {object} server - HTTP server instance
 */
function initWebSocket(server) {
  // Create WebSocket server
  const wss = new WebSocket.Server({ server, path: '/ws' });
  
  // Store connected clients with their user IDs
  const clients = new Map();
  
  // Handle new connections
  wss.on('connection', async (ws, req) => {
    console.log('WebSocket connection established');
    
    let userId = null;
    
    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'auth':
            // Authenticate user with token
            userId = await authenticateUser(data.token);
            if (userId) {
              // Store client connection with user ID
              clients.set(userId, ws);
              
              // Update user's online status
              await User.findByIdAndUpdate(userId, { 
                isOnline: true,
                lastActive: new Date()
              });
              
              // Send authentication success
              sendToClient(ws, {
                type: 'auth_success',
                userId
              });
              
              // Send pending notifications
              await sendPendingNotifications(userId, ws);
            } else {
              // Send authentication failure
              sendToClient(ws, {
                type: 'auth_error',
                message: 'Authentication failed'
              });
            }
            break;
            
          case 'message':
            // Handle direct message
            if (userId && data.recipientId && data.content) {
              const message = await createMessage(userId, data.recipientId, data.content);
              
              // Send to recipient if online
              const recipientWs = clients.get(data.recipientId);
              if (recipientWs && isClientConnected(recipientWs)) {
                sendToClient(recipientWs, {
                  type: 'new_message',
                  message
                });
              }
              
              // Confirm to sender
              sendToClient(ws, {
                type: 'message_sent',
                messageId: message._id
              });
            }
            break;
            
          case 'typing':
            // Handle typing indicator
            if (userId && data.recipientId) {
              const recipientWs = clients.get(data.recipientId);
              if (recipientWs && isClientConnected(recipientWs)) {
                sendToClient(recipientWs, {
                  type: 'typing_indicator',
                  userId,
                  isTyping: data.isTyping || false
                });
              }
            }
            break;
            
          case 'presence':
            // Update user status/activity
            if (userId) {
              const status = data.status || 'online';
              await User.findByIdAndUpdate(userId, { 
                isOnline: status !== 'offline',
                lastActive: new Date()
              });
            }
            break;
            
          case 'join_event':
            // Join a game event room
            if (userId && data.eventId) {
              // Logic to join event channel
              const event = await GameEvent.findById(data.eventId);
              if (event) {
                // Broadcasting to all event participants
                for (const participant of event.participants) {
                  const participantWs = clients.get(participant.user.toString());
                  if (participantWs && isClientConnected(participantWs)) {
                    sendToClient(participantWs, {
                      type: 'event_update',
                      action: 'join',
                      eventId: data.eventId,
                      userId
                    });
                  }
                }
              }
            }
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendToClient(ws, {
          type: 'error',
          message: 'Failed to process message'
        });
      }
    });
    
    // Handle client disconnection
    ws.on('close', async () => {
      console.log('WebSocket connection closed');
      
      if (userId) {
        // Update user's online status
        await User.findByIdAndUpdate(userId, { 
          isOnline: false,
          lastActive: new Date()
        });
        
        // Remove client from map
        clients.delete(userId);
      }
    });
  });
  
  // Heartbeat to detect disconnected clients
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!isClientConnected(ws)) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  // Handle client ping response
  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });
  
  // Helper function to check if client is connected
  function isClientConnected(ws) {
    return ws.readyState === WebSocket.OPEN;
  }
  
  // Helper function to send data to client
  function sendToClient(ws, data) {
    if (isClientConnected(ws)) {
      ws.send(JSON.stringify(data));
    }
  }
  
  // Helper function to authenticate user with JWT
  async function authenticateUser(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }
  
  // Helper function to create and save a message
  async function createMessage(senderId, recipientId, content) {
    try {
      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] }
      });
      
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, recipientId],
          lastMessage: content,
          lastMessageDate: new Date()
        });
      } else {
        // Update conversation with last message
        conversation.lastMessage = content;
        conversation.lastMessageDate = new Date();
        await conversation.save();
      }
      
      // Create message
      const message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        recipient: recipientId,
        content,
        read: false
      });
      
      // Populate sender and return
      return await Message.findById(message._id).populate('sender', 'username profileImage');
    } catch (error) {
      console.error('Create message error:', error);
      throw error;
    }
  }
  
  // Helper function to send pending notifications to user
  async function sendPendingNotifications(userId, ws) {
    try {
      // Get unread messages
      const unreadMessages = await Message.find({
        recipient: userId,
        read: false
      }).populate('sender', 'username profileImage');
      
      // Send unread messages to client
      if (unreadMessages.length > 0) {
        sendToClient(ws, {
          type: 'unread_messages',
          messages: unreadMessages
        });
      }
      
      // Get pending friend requests
      const pendingRequests = await User.aggregate([
        {
          $lookup: {
            from: 'friendships',
            let: { userId: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$recipient', userId] },
                      { $eq: ['$status', 'pending'] }
                    ]
                  }
                }
              }
            ],
            as: 'friendRequests'
          }
        },
        { $unwind: '$friendRequests' },
        { $match: { '_id': { $toString: '$friendRequests.requester' } } },
        { $project: { _id: 1, username: 1, profileImage: 1 } }
      ]);
      
      // Send pending friend requests to client
      if (pendingRequests.length > 0) {
        sendToClient(ws, {
          type: 'friend_requests',
          requests: pendingRequests
        });
      }
      
      // Get upcoming events
      const upcomingEvents = await GameEvent.find({
        participants: { $elemMatch: { user: userId } },
        startTime: { $gte: new Date() },
        endTime: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } // Next 24 hours
      }).limit(5);
      
      // Send upcoming events to client
      if (upcomingEvents.length > 0) {
        sendToClient(ws, {
          type: 'upcoming_events',
          events: upcomingEvents
        });
      }
    } catch (error) {
      console.error('Send pending notifications error:', error);
    }
  }
  
  // Broadcast to all connected clients
  function broadcast(data, excludeUserId = null) {
    clients.forEach((ws, clientUserId) => {
      if (isClientConnected(ws) && clientUserId !== excludeUserId) {
        sendToClient(ws, data);
      }
    });
  }
  
  // Broadcast to specific users
  function broadcastToUsers(userIds, data) {
    userIds.forEach(userId => {
      const ws = clients.get(userId);
      if (ws && isClientConnected(ws)) {
        sendToClient(ws, data);
      }
    });
  }
  
  // Make these functions available to other parts of the application
  return {
    clients,
    sendToClient,
    broadcast,
    broadcastToUsers
  };
}

module.exports = initWebSocket;