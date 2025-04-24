import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationContainer } from '../components/ui/NotificationPopup';
import websocketService from '../services/websocketService';

// Create context
const NotificationContext = createContext();

/**
 * NotificationProvider Component
 * Manages application notifications and integrates with WebSocket for real-time notifications
 */
export const NotificationProvider = ({ children, authToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Initialize WebSocket connection and set up event handlers
  useEffect(() => {
    if (authToken) {
      websocketService.initialize(authToken);
      
      // Set up WebSocket notification handlers
      websocketService
        .on('new_message', handleNewMessage)
        .on('friend_requests', handleFriendRequests)
        .on('upcoming_events', handleUpcomingEvents)
        .on('achievement_unlocked', handleAchievementUnlocked);
        
      return () => {
        // Clean up WebSocket notification handlers
        websocketService
          .off('new_message', handleNewMessage)
          .off('friend_requests', handleFriendRequests)
          .off('upcoming_events', handleUpcomingEvents)
          .off('achievement_unlocked', handleAchievementUnlocked);
      };
    }
  }, [authToken]);
  
  // Handle incoming message notification
  const handleNewMessage = (data) => {
    if (data.message) {
      const { _id, sender, content } = data.message;
      
      addNotification({
        id: `message-${_id}`,
        title: 'New Message',
        message: `${sender.username}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        type: 'message',
        duration: 5000,
        image: sender.profileImage,
        action: () => navigateToChat(sender._id),
        actionText: 'Reply',
      });
    }
  };
  
  // Handle friend requests notification
  const handleFriendRequests = (data) => {
    if (data.requests && data.requests.length > 0) {
      data.requests.forEach(request => {
        addNotification({
          id: `friend-request-${request._id}`,
          title: 'Friend Request',
          message: `${request.username} sent you a friend request`,
          type: 'friend-request',
          duration: 7000,
          image: request.profileImage,
          action: () => navigateToFriendRequests(),
          actionText: 'View',
        });
      });
    }
  };
  
  // Handle upcoming events notification
  const handleUpcomingEvents = (data) => {
    if (data.events && data.events.length > 0) {
      data.events.forEach(event => {
        const eventTime = new Date(event.startTime);
        const timeString = eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        addNotification({
          id: `event-${event._id}`,
          title: 'Upcoming Event',
          message: `"${event.title}" starting at ${timeString}`,
          type: 'game-event',
          duration: 7000,
          action: () => navigateToEvent(event._id),
          actionText: 'View Details',
        });
      });
    }
  };
  
  // Handle achievement unlocked notification
  const handleAchievementUnlocked = (data) => {
    if (data.achievement) {
      const { _id, name, game, rarity } = data.achievement;
      
      addNotification({
        id: `achievement-${_id}`,
        title: 'Achievement Unlocked!',
        message: `${name} - ${game.name} (${rarity})`,
        type: 'achievement',
        duration: 8000,
        action: () => navigateToAchievement(_id),
        actionText: 'View',
      });
    }
  };
  
  // Navigation functions
  const navigateToChat = (userId) => {
    console.log('Navigate to chat with user:', userId);
    // Implementation would depend on your routing setup
  };
  
  const navigateToFriendRequests = () => {
    console.log('Navigate to friend requests');
    // Implementation would depend on your routing setup
  };
  
  const navigateToEvent = (eventId) => {
    console.log('Navigate to event:', eventId);
    // Implementation would depend on your routing setup
  };
  
  const navigateToAchievement = (achievementId) => {
    console.log('Navigate to achievement:', achievementId);
    // Implementation would depend on your routing setup
  };
  
  // Add a new notification
  const addNotification = (notification) => {
    // Create a unique ID if one isn't provided
    const id = notification.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationCount(prev => prev + 1);
  };
  
  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  // Reset notification count
  const resetNotificationCount = () => {
    setNotificationCount(0);
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notificationCount,
        addNotification,
        removeNotification,
        clearNotifications,
        resetNotificationCount,
      }}
    >
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;