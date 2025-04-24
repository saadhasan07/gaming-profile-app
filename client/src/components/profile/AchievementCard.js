import React, { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaTrophy, FaShare, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AchievementCard.css';

// Utility to get color based on rarity
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common':
      return '#8C8C8C';
    case 'uncommon':
      return '#2ECC71';
    case 'rare':
      return '#3498DB';
    case 'epic':
      return '#9B59B6';
    case 'legendary':
      return '#F1C40F';
    default:
      return '#8C8C8C';
  }
};

const AchievementCard = ({ achievement, game, isOwnProfile, onShareSuccess }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!isOwnProfile) return;
    
    try {
      setIsSharing(true);
      await axios.post(`/api/gamestats/achievements/${game}/share/${achievement._id}`, {
        platform: achievement.platform
      });
      
      // Call the social sharing API
      await axios.post('/api/sharing/achievement', {
        achievementId: achievement._id,
        game,
        name: achievement.name,
        description: achievement.description || '',
        rarity: achievement.rarity
      });
      
      toast.success('Achievement shared successfully!');
      if (onShareSuccess) onShareSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to share achievement');
    } finally {
      setIsSharing(false);
    }
  };

  const rarityColor = getRarityColor(achievement.rarity);
  const unlockedDate = achievement.unlockedDate 
    ? format(new Date(achievement.unlockedDate), 'MMM d, yyyy')
    : 'Unknown date';

  return (
    <div className="achievement-card">
      <div 
        className="achievement-icon"
        style={{ 
          backgroundImage: achievement.iconUrl 
            ? `url(${achievement.iconUrl})` 
            : 'none',
          backgroundColor: achievement.iconUrl ? 'transparent' : '#2d325a'
        }}
      >
        {!achievement.iconUrl && (
          <FaTrophy size={24} color={rarityColor} />
        )}
      </div>
      
      <div className="achievement-content">
        <div className="achievement-name-container">
          <h4 className="achievement-name">{achievement.name}</h4>
          <div 
            className="rarity-badge"
            style={{ backgroundColor: rarityColor }}
          >
            {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
            {achievement.rarityPercentage > 0 && (
              <span className="rarity-percentage"> ({achievement.rarityPercentage}%)</span>
            )}
          </div>
        </div>
        
        {achievement.description && (
          <p className="achievement-description">{achievement.description}</p>
        )}
        
        <div className="achievement-details">
          <span className="unlocked-date">Unlocked: {unlockedDate}</span>
          
          {isOwnProfile && (
            <button 
              className={`share-button ${achievement.isShared ? 'shared' : ''}`}
              onClick={handleShare}
              disabled={isSharing || achievement.isShared}
              title={achievement.isShared ? 'Already shared' : 'Share this achievement'}
            >
              {achievement.isShared ? (
                <>
                  <FaCheck /> Shared
                </>
              ) : isSharing ? (
                'Sharing...'
              ) : (
                <>
                  <FaShare /> Share
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div 
        className="achievement-border" 
        style={{ backgroundColor: rarityColor }}
      ></div>
    </div>
  );
};

export default AchievementCard;