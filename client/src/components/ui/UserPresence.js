import React, { useState, useEffect } from 'react';
import './UserPresence.css';

/**
 * UserPresence Component
 * Shows a user's online status with animated indicators
 */
const UserPresence = ({ 
  status = 'offline', 
  size = 'medium',
  showLabel = false,
  pulseEffect = true,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Update animation state when status changes
  useEffect(() => {
    if (status === 'online' || status === 'away' || status === 'busy') {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [status]);
  
  // Get status label
  const getStatusLabel = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      case 'in-game':
        return 'In Game';
      case 'streaming':
        return 'Streaming';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className={`user-presence ${size} ${className}`}>
      <div className={`presence-indicator ${status} ${isAnimating && pulseEffect ? 'pulse' : ''}`}>
        {(status === 'in-game' || status === 'streaming') && (
          <div className="presence-icon">
            {status === 'in-game' ? '🎮' : '📱'}
          </div>
        )}
      </div>
      
      {showLabel && (
        <span className="presence-label">{getStatusLabel()}</span>
      )}
    </div>
  );
};

export default UserPresence;