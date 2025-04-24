// jest-dom adds custom jest matchers for asserting on DOM nodes
import '@testing-library/jest-dom';

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    
    // Auto "connect" after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 100);
  }
  
  send(data) {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Handle the message internally for testing
    if (this.mockMessageHandler) {
      this.mockMessageHandler(data);
    }
  }
  
  close() {
    this.readyState = WebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = WebSocket.CLOSED;
      if (this.onclose) this.onclose();
    }, 50);
  }
  
  // Test helper to simulate receiving a message
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data });
    }
  }
  
  // Test helper to simulate an error
  simulateError(error) {
    if (this.onerror) {
      this.onerror(error);
    }
  }
  
  // Add message handler for testing sent messages
  setMockMessageHandler(handler) {
    this.mockMessageHandler = handler;
  }
}

// Define WebSocket constants
MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket;

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    key(i) {
      return Object.keys(store)[i] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
  }
  
  observe(element) {
    this.elements.add(element);
  }
  
  unobserve(element) {
    this.elements.delete(element);
  }
  
  disconnect() {
    this.elements.clear();
  }
  
  // Test helper to trigger intersection
  triggerIntersection(entries) {
    this.callback(entries, this);
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = callback => setTimeout(callback, 0);
global.cancelAnimationFrame = jest.fn();

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = jest.fn((...args) => {
  // Filter out specific errors or warnings if needed
  if (args[0]?.includes && args[0].includes('Warning: ReactDOM.render')) {
    return;
  }
  originalConsoleError(...args);
});