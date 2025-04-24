/**
 * WebSocket Service
 * Manages WebSocket connection and message handling throughout the application
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
    this.messageHandlers = new Map();
    this.connectionStatusHandlers = [];
  }

  /**
   * Initialize the WebSocket connection
   * @param {string} token - Authentication token
   */
  initialize(token) {
    if (this.socket) {
      this.socket.close();
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.socket = new WebSocket(wsUrl);
    
    // Connection opened
    this.socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      this.connected = true;
      this.reconnectAttempts = 0;
      
      // Send authentication message
      this.send({
        type: 'auth',
        token
      });
      
      // Notify connection status handlers
      this._notifyConnectionStatus(true);
    });
    
    // Listen for messages
    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        this._handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });
    
    // Connection closed
    this.socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      this.connected = false;
      
      // Notify connection status handlers
      this._notifyConnectionStatus(false);
      
      // Attempt to reconnect
      this._attemptReconnect(token);
    });
    
    // Connection error
    this.socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      this.connected = false;
      
      // Notify connection status handlers
      this._notifyConnectionStatus(false);
    });
    
    return this;
  }
  
  /**
   * Send a message through the WebSocket
   * @param {object} data - Message data to send
   */
  send(data) {
    if (this.connected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    } else {
      console.warn('WebSocket not connected. Message not sent:', data);
      return false;
    }
  }
  
  /**
   * Register a handler for a specific message type
   * @param {string} type - Message type to listen for
   * @param {function} handler - Function to handle the message
   */
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type).push(handler);
    
    return this; // For chaining
  }
  
  /**
   * Unregister a handler for a specific message type
   * @param {string} type - Message type to unregister from
   * @param {function} handler - Function to remove (if not provided, removes all for this type)
   */
  off(type, handler) {
    if (!this.messageHandlers.has(type)) {
      return this;
    }
    
    if (!handler) {
      this.messageHandlers.delete(type);
    } else {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      
      if (index !== -1) {
        handlers.splice(index, 1);
      }
      
      if (handlers.length === 0) {
        this.messageHandlers.delete(type);
      }
    }
    
    return this; // For chaining
  }
  
  /**
   * Register a handler for connection status changes
   * @param {function} handler - Function to handle status change
   */
  onConnectionStatus(handler) {
    this.connectionStatusHandlers.push(handler);
    
    // Immediately notify with current status
    handler(this.connected);
    
    return this; // For chaining
  }
  
  /**
   * Unregister a connection status handler
   * @param {function} handler - Function to remove
   */
  offConnectionStatus(handler) {
    const index = this.connectionStatusHandlers.indexOf(handler);
    
    if (index !== -1) {
      this.connectionStatusHandlers.splice(index, 1);
    }
    
    return this; // For chaining
  }
  
  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connected = false;
    this._notifyConnectionStatus(false);
    
    return this;
  }
  
  /**
   * Update user presence status
   * @param {string} status - User status (online, away, busy, offline)
   */
  updatePresence(status) {
    return this.send({
      type: 'presence',
      status
    });
  }
  
  /**
   * Send a direct message to another user
   * @param {string} recipientId - Recipient user ID
   * @param {string} content - Message content
   */
  sendMessage(recipientId, content) {
    return this.send({
      type: 'message',
      recipientId,
      content
    });
  }
  
  /**
   * Send typing indicator to another user
   * @param {string} recipientId - Recipient user ID
   * @param {boolean} isTyping - Whether user is typing
   */
  sendTypingIndicator(recipientId, isTyping = true) {
    return this.send({
      type: 'typing',
      recipientId,
      isTyping
    });
  }
  
  /**
   * Join a game event room
   * @param {string} eventId - Game event ID
   */
  joinEvent(eventId) {
    return this.send({
      type: 'join_event',
      eventId
    });
  }
  
  /**
   * Attempt to reconnect WebSocket
   * @private
   * @param {string} token - Authentication token
   */
  _attemptReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached. Giving up.');
      return;
    }
    
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.initialize(token);
    }, this.reconnectInterval);
  }
  
  /**
   * Handle incoming WebSocket messages
   * @private
   * @param {object} data - Message data
   */
  _handleMessage(data) {
    if (!data || !data.type) {
      console.warn('Received invalid WebSocket message:', data);
      return;
    }
    
    console.log('WebSocket received:', data.type);
    
    // Call registered handlers for this message type
    if (this.messageHandlers.has(data.type)) {
      const handlers = this.messageHandlers.get(data.type);
      
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${data.type} handler:`, error);
        }
      });
    }
  }
  
  /**
   * Notify all connection status handlers
   * @private
   * @param {boolean} connected - Connection status
   */
  _notifyConnectionStatus(connected) {
    this.connectionStatusHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection status handler:', error);
      }
    });
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;