import React, { useState, useEffect, useRef } from 'react';
import './AchievementUnlocked.css';

/**
 * AchievementUnlocked Component
 * Displays an animated achievement notification with particle effects
 */
const AchievementUnlocked = ({ 
  achievement, 
  onClose, 
  autoHide = true, 
  duration = 5000 
}) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Generate random particles
  useEffect(() => {
    if (visible && !closing && containerRef.current) {
      const particleCount = 30;
      const newParticles = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 6 + 2,
          speedX: (Math.random() - 0.5) * 3,
          speedY: (Math.random() - 0.5) * 3,
          opacity: Math.random() * 0.5 + 0.5,
          color: getRandomColor(),
        });
      }
      
      setParticles(newParticles);
      startParticleAnimation();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, closing]);
  
  // Auto-hide achievement after duration
  useEffect(() => {
    if (autoHide && visible && !closing) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, visible, closing, duration]);
  
  // Show achievement with animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle close with animation
  const handleClose = () => {
    setClosing(true);
    
    // Wait for animation to complete before unmounting
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 500);
  };
  
  // Animation loop for particles
  const startParticleAnimation = () => {
    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.speedX,
          y: particle.y + particle.speedY,
          opacity: particle.opacity > 0.01 ? particle.opacity - 0.005 : 0,
        })).filter(particle => particle.opacity > 0)
      );
      
      if (particles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // Get random color for particles based on rarity
  const getRandomColor = () => {
    const rarityColors = {
      common: ['#8C8C8C', '#A0A0A0', '#B8B8B8'],
      uncommon: ['#2ECC71', '#27AE60', '#1ABC9C'],
      rare: ['#3498DB', '#2980B9', '#00A8FF'],
      epic: ['#9B59B6', '#8E44AD', '#7D3C98'],
      legendary: ['#F1C40F', '#F39C12', '#FFA500'],
    };
    
    const colors = rarityColors[achievement.rarity?.toLowerCase()] || rarityColors.common;
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Get rarity color
  const getRarityColor = () => {
    switch (achievement?.rarity?.toLowerCase()) {
      case 'common': return '#8C8C8C';
      case 'uncommon': return '#2ECC71';
      case 'rare': return '#3498DB';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#F1C40F';
      default: return '#8C8C8C';
    }
  };
  
  if (!achievement) {
    return null;
  }
  
  return (
    <div 
      ref={containerRef}
      className={`achievement-unlocked-container ${visible ? 'visible' : ''} ${closing ? 'closing' : ''}`}
    >
      <div className="achievement-unlocked-content">
        {/* Achievement title */}
        <div className="achievement-unlocked-header">
          <div className="achievement-unlocked-title">Achievement Unlocked!</div>
          <button className="achievement-unlocked-close" onClick={handleClose}>×</button>
        </div>
        
        {/* Achievement details */}
        <div className="achievement-unlocked-details">
          {achievement.image ? (
            <img 
              src={achievement.image} 
              alt={achievement.name} 
              className="achievement-unlocked-image" 
            />
          ) : (
            <div 
              className="achievement-unlocked-image-placeholder"
              style={{ borderColor: getRarityColor() }}
            >
              <span>🏆</span>
            </div>
          )}
          
          <div className="achievement-unlocked-info">
            <h3 className="achievement-name">{achievement.name}</h3>
            <div className="achievement-game">{achievement.game}</div>
            <div 
              className={`achievement-rarity ${achievement.rarity?.toLowerCase()}`}
            >
              {achievement.rarity}
            </div>
            <div className="achievement-description">{achievement.description}</div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="achievement-unlocked-actions">
          <button 
            className="achievement-unlocked-share"
            onClick={() => console.log('Share achievement:', achievement.name)}
          >
            Share
          </button>
          <button 
            className="achievement-unlocked-view"
            onClick={() => console.log('View achievement:', achievement.name)}
          >
            View Details
          </button>
        </div>
      </div>
      
      {/* Particle effects */}
      <div className="achievement-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementUnlocked;