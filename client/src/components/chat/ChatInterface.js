import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FaPaperPlane, FaSmile, FaTimes, FaUser, FaCircle } from 'react-icons/fa';
import websocketService from '../../services/websocketService';
import './ChatInterface.css';

const ChatInterface = ({ authToken, minimized = false, onClose, recipientId, recipientName, recipientImage }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [connected, setConnected] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    if (authToken) {
      // Connect to WebSocket server
      websocketService.initialize(authToken);
      
      // Register message handlers
      websocketService
        .on('auth_success', handleAuthSuccess)
        .on('new_message', handleNewMessage)
        .on('message_sent', handleMessageSent)
        .on('typing_indicator', handleTypingIndicator)
        .onConnectionStatus(handleConnectionStatus);
      
      // Clean up event listeners on unmount
      return () => {
        websocketService
          .off('auth_success', handleAuthSuccess)
          .off('new_message', handleNewMessage)
          .off('message_sent', handleMessageSent)
          .off('typing_indicator', handleTypingIndicator)
          .offConnectionStatus(handleConnectionStatus);
      };
    }
  }, [authToken, recipientId]);
  
  // Load conversation history from API when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/conversation/${recipientId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    
    if (recipientId && authToken) {
      fetchMessages();
    }
  }, [recipientId, authToken]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handler functions for WebSocket events
  const handleAuthSuccess = (data) => {
    console.log('WebSocket authenticated:', data);
  };
  
  const handleNewMessage = (data) => {
    if (data.message && data.message.sender && 
        (data.message.sender._id === recipientId || 
         data.message.recipient === recipientId)) {
      setMessages(prev => [...prev, data.message]);
      
      // Mark message as read
      fetch(`/api/messages/${data.message._id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }).catch(err => console.error('Failed to mark message as read:', err));
    }
    
    // Reset typing indicator
    setRecipientTyping(false);
  };
  
  const handleMessageSent = (data) => {
    console.log('Message sent with ID:', data.messageId);
  };
  
  const handleTypingIndicator = (data) => {
    if (data.userId === recipientId) {
      setRecipientTyping(data.isTyping);
    }
  };
  
  const handleConnectionStatus = (status) => {
    setConnected(status);
  };
  
  // Send message
  const sendMessage = () => {
    if (!messageInput.trim() || !connected) return;
    
    // Add message to local state immediately for UI responsiveness
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: messageInput,
      sender: { _id: 'currentUser' }, // Will be replaced by actual message
      recipient: recipientId,
      timestamp: new Date().toISOString(),
      isTemp: true // Flag to identify temporary messages
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Send to recipient via WebSocket
    websocketService.sendMessage(recipientId, messageInput);
    
    // Clear input
    setMessageInput('');
    
    // Reset typing indicator
    handleTypingStop();
  };
  
  // Handle typing indicator
  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      websocketService.sendTypingIndicator(recipientId, true);
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(handleTypingStop, 3000);
    setTypingTimeout(timeout);
  };
  
  const handleTypingStop = () => {
    setIsTyping(false);
    websocketService.sendTypingIndicator(recipientId, false);
    
    // Clear timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };
  
  // Toggle chat minimized state
  const toggleMinimized = () => {
    setIsMinimized(prev => !prev);
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    handleTypingStart();
  };
  
  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Render chat interface
  return (
    <div className={`chat-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Chat header */}
      <div className="chat-header" onClick={toggleMinimized}>
        <div className="chat-header-info">
          {recipientImage ? (
            <img src={recipientImage} alt={recipientName} className="chat-avatar" />
          ) : (
            <div className="chat-avatar default-avatar">
              <FaUser />
            </div>
          )}
          <div className="chat-recipient-info">
            <div className="chat-recipient-name">{recipientName}</div>
            <div className="chat-status">
              {connected ? (
                <>
                  <FaCircle className="online-status-icon" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <FaCircle className="offline-status-icon" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
      </div>
      
      {/* Chat body (hidden when minimized) */}
      {!isMinimized && (
        <>
          <div className="chat-body" ref={chatBodyRef}>
            {messages.length > 0 ? (
              messages.map((message) => (
                <div 
                  key={message._id} 
                  className={`chat-message ${message.sender._id === 'currentUser' || message.sender === 'currentUser' ? 'sent' : 'received'} ${message.isTemp ? 'temp-message' : ''}`}
                >
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {message.timestamp ? formatTime(message.timestamp) : 'Sending...'}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-chat">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            
            {recipientTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat input */}
          <div className="chat-footer">
            <textarea
              className="chat-input"
              placeholder="Type a message..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <button 
              className={`send-button ${!messageInput.trim() || !connected ? 'disabled' : ''}`}
              onClick={sendMessage}
              disabled={!messageInput.trim() || !connected}
            >
              <FaPaperPlane />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;