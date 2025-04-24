import React, { useState, useRef, useEffect } from 'react';
import './AnimatedCard.css';

/**
 * AnimatedCard Component
 * A card with hover animations, 3D tilt effect, and optional glow
 */
const AnimatedCard = ({ 
  children, 
  onClick,
  className = '',
  variant = 'default',
  glowColor = 'primary',
  tiltEffect = true,
  hoverScale = true,
  hoverable = true,
  hasGlow = true,
  ...props 
}) => {
  const [tiltValues, setTiltValues] = useState({ tiltX: 0, tiltY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  // Handle mouse movement for 3D tilt effect
  const handleMouseMove = (e) => {
    if (!tiltEffect || !cardRef.current || !isHovered) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = (centerY - y) / 10;
    const tiltY = (x - centerX) / 10;
    
    setTiltValues({ tiltX, tiltY });
  };
  
  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltValues({ tiltX: 0, tiltY: 0 });
  };
  
  // Handle hover state
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  // Clean up event listeners
  useEffect(() => {
    const card = cardRef.current;
    
    if (card && tiltEffect) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      card.addEventListener('mouseenter', handleMouseEnter);
      
      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('mouseenter', handleMouseEnter);
      };
    }
  }, [tiltEffect, isHovered]);
  
  return (
    <div
      ref={cardRef}
      className={`
        animated-card 
        ${variant} 
        ${glowColor} 
        ${hoverable ? 'hoverable' : ''}
        ${hasGlow ? 'has-glow' : ''}
        ${hoverScale ? 'hover-scale' : ''}
        ${isHovered ? 'hovered' : ''}
        ${className}
      `}
      onClick={onClick}
      style={{
        transform: tiltEffect && isHovered 
          ? `perspective(1000px) rotateX(${tiltValues.tiltX}deg) rotateY(${tiltValues.tiltY}deg) ${hoverScale && isHovered ? 'scale(1.05)' : ''}`
          : hoverScale && isHovered ? 'scale(1.05)' : 'perspective(1000px)'
      }}
      {...props}
    >
      <div className="card-content">
        {children}
      </div>
      
      {hasGlow && (
        <div className={`card-glow ${glowColor} ${isHovered ? 'active' : ''}`}></div>
      )}
      
      <div className={`card-border ${glowColor} ${isHovered ? 'active' : ''}`}></div>
    </div>
  );
};

export default AnimatedCard;