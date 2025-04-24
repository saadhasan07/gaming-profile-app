import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import './ChatManager.css';

/**
 * ChatManager Component
 * Manages multiple chat windows and provides a friends list
 */
const ChatManager = ({ authToken, currentUserId }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isFriendsListOpen, setIsFriendsListOpen] = useState(false);
  
  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFriends(data.friends || []);
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      }
    };
    
    if (authToken) {
      fetchFriends();
    }
  }, [authToken]);
  
  // Open a chat with a friend
  const openChat = (friend) => {
    // Check if chat already exists
    if (!activeChats.some(chat => chat.userId === friend._id)) {
      // Add new chat
      setActiveChats(prev => [
        ...prev,
        {
          userId: friend._id,
          username: friend.username,
          profileImage: friend.profileImage,
          minimized: false
        }
      ]);
    } else {
      // Un-minimize if it exists
      setActiveChats(prev => 
        prev.map(chat => 
          chat.userId === friend._id 
            ? { ...chat, minimized: false } 
            : chat
        )
      );
    }
    
    // Close friends list
    setIsFriendsListOpen(false);
  };
  
  // Close a chat
  const closeChat = (userId) => {
    setActiveChats(prev => prev.filter(chat => chat.userId !== userId));
  };
  
  // Toggle chat minimized state
  const toggleMinimized = (userId) => {
    setActiveChats(prev => 
      prev.map(chat => 
        chat.userId === userId 
          ? { ...chat, minimized: !chat.minimized } 
          : chat
      )
    );
  };
  
  // Toggle friends list
  const toggleFriendsList = () => {
    setIsFriendsListOpen(prev => !prev);
  };
  
  return (
    <div className="chat-manager">
      {/* Active chat windows */}
      <div className="active-chats">
        {activeChats.map((chat, index) => (
          <ChatInterface
            key={chat.userId}
            authToken={authToken}
            recipientId={chat.userId}
            recipientName={chat.username}
            recipientImage={chat.profileImage}
            minimized={chat.minimized}
            onClose={() => closeChat(chat.userId)}
            style={{
              right: `${(index * 20) + 20}px`,
              zIndex: 1000 - index
            }}
          />
        ))}
      </div>
      
      {/* Friends List Button */}
      <button className="friends-list-toggle" onClick={toggleFriendsList}>
        <div className="friends-icon">
          <div className="friends-icon-dot"></div>
          <div className="friends-icon-dot"></div>
          <div className="friends-icon-dot"></div>
        </div>
        <span>Friends</span>
      </button>
      
      {/* Friends List */}
      {isFriendsListOpen && (
        <div className="friends-list-container">
          <div className="friends-list-header">
            <h3>Online Friends</h3>
            <button className="close-friends-list" onClick={toggleFriendsList}>×</button>
          </div>
          
          <div className="friends-list">
            {friends.length > 0 ? (
              friends.map(friend => (
                <div 
                  key={friend._id}
                  className={`friend-item ${friend.isOnline ? 'online' : 'offline'}`}
                  onClick={() => openChat(friend)}
                >
                  {friend.profileImage ? (
                    <img src={friend.profileImage} alt={friend.username} className="friend-avatar" />
                  ) : (
                    <div className="friend-avatar default-avatar">{friend.username.charAt(0)}</div>
                  )}
                  <div className="friend-info">
                    <div className="friend-name">{friend.username}</div>
                    <div className="friend-status">
                      <span className="status-indicator"></span>
                      <span>{friend.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-friends">
                <p>No friends found</p>
                <button className="add-friends-btn">Find Friends</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatManager;