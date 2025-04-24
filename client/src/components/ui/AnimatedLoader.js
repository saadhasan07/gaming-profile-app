import React from 'react';
import './AnimatedLoader.css';

/**
 * AnimatedLoader Component
 * Displays animated loading indicators with various styles
 */
const AnimatedLoader = ({ 
  type = 'spinner', 
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false, 
  className = ''
}) => {
  // Render appropriate loader based on type
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`loader-dots ${size} ${color}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
        
      case 'pulse':
        return (
          <div className={`loader-pulse ${size} ${color}`}>
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
            <div className="pulse-circle"></div>
          </div>
        );
        
      case 'bar':
        return (
          <div className={`loader-bar ${size} ${color}`}>
            <div className="bar-progress"></div>
          </div>
        );
        
      case 'circular':
        return (
          <div className={`loader-circular ${size} ${color}`}>
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
            </svg>
          </div>
        );
        
      case 'grid':
        return (
          <div className={`loader-grid ${size} ${color}`}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className="grid-square"></div>
            ))}
          </div>
        );
        
      case 'game':
        return (
          <div className={`loader-game ${size} ${color}`}>
            <div className="game-controller">
              <div className="controller-body"></div>
              <div className="controller-btn left"></div>
              <div className="controller-btn right"></div>
            </div>
          </div>
        );
        
      case 'spinner':
      default:
        return (
          <div className={`loader-spinner ${size} ${color}`}>
            <div className="spinner-ring"></div>
          </div>
        );
    }
  };
  
  // Full screen overlay loader
  if (fullScreen) {
    return (
      <div className={`loader-fullscreen ${overlay ? 'with-overlay' : ''} ${className}`}>
        <div className="loader-content">
          {renderLoader()}
          {text && <div className="loader-text">{text}</div>}
        </div>
      </div>
    );
  }
  
  // Regular inline loader
  return (
    <div className={`loader-container ${className}`}>
      {renderLoader()}
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default AnimatedLoader;