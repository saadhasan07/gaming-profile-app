import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import './NotificationPopup.css';

/**
 * NotificationPopup Component
 * Displays animated notification popups for various events (messages, achievements, etc.)
 */
const NotificationPopup = ({ 
  message, 
  type = 'info', 
  title, 
  duration = 5000,
  onClose,
  action,
  actionText,
  image
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="notification-icon success" />;
      case 'error':
        return <FaTimesCircle className="notification-icon error" />;
      case 'warning':
        return <FaExclamationCircle className="notification-icon warning" />;
      case 'info':
      default:
        return <FaInfoCircle className="notification-icon info" />;
    }
  };
  
  // Show notification with animation when component mounts
  useEffect(() => {
    // Small timeout to ensure CSS animation works
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-close after duration
  useEffect(() => {
    if (duration && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, isVisible]);
  
  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    
    // Wait for animation to complete before unmounting
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300); // Match CSS animation duration
  };
  
  // Handle action click
  const handleAction = () => {
    if (action) {
      action();
    }
    handleClose();
  };
  
  // If not visible, don't render
  if (!isVisible && isClosing) {
    return null;
  }
  
  return (
    <div className={`notification-popup ${type} ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}>
      <div className="notification-content">
        {/* Close button */}
        <button className="notification-close" onClick={handleClose}>
          <FaTimes />
        </button>
        
        {/* Header */}
        <div className="notification-header">
          {image ? (
            <img src={image} alt="" className="notification-image" />
          ) : (
            getIcon()
          )}
          
          <div className="notification-title">
            {title || type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        </div>
        
        {/* Message */}
        <div className="notification-message">{message}</div>
        
        {/* Action button */}
        {action && actionText && (
          <button className="notification-action" onClick={handleAction}>
            {actionText}
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      {duration > 0 && (
        <div 
          className="notification-progress" 
          style={{ animationDuration: `${duration}ms` }}
        ></div>
      )}
    </div>
  );
};

// Create notification manager for multiple notifications
export const NotificationContainer = ({ notifications = [], onClose }) => {
  return (
    <div className="notification-container">
      {notifications.map((notification, index) => (
        <NotificationPopup
          key={notification.id || index}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => onClose(notification.id || index)}
          action={notification.action}
          actionText={notification.actionText}
          image={notification.image}
        />
      ))}
    </div>
  );
};

export default NotificationPopup;