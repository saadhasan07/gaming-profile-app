import React, { useState } from 'react';
import './AnimatedButton.css';

/**
 * AnimatedButton Component
 * A button with hover and click animations, neon glow effect, and optional icon
 */
const AnimatedButton = ({ 
  children, 
  onClick, 
  icon, 
  color = 'primary', 
  size = 'medium',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };
  
  const handleMouseUp = () => {
    if (!disabled) {
      setIsPressed(false);
    }
  };
  
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };
  
  return (
    <button
      type={type}
      className={`
        animated-button 
        ${color} 
        ${size}
        ${fullWidth ? 'full-width' : ''}
        ${disabled ? 'disabled' : ''}
        ${isPressed ? 'pressed' : ''}
        ${className}
      `}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      disabled={disabled}
      {...props}
    >
      <span className="button-content">
        {icon && <span className="button-icon">{icon}</span>}
        <span className="button-text">{children}</span>
      </span>
      <span className="button-glow"></span>
      <span className="button-border"></span>
      <span className="button-hover-effect"></span>
    </button>
  );
};

export default AnimatedButton;