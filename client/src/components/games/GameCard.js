import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaUsers, FaTrophy, FaGamepad } from 'react-icons/fa';
import './GameCard.css';

const GameCard = ({ game }) => {
  // Get platform icons to display
  const getPlatformIcons = () => {
    return game.platforms.map((platform, index) => {
      let icon;
      switch (platform) {
        case 'pc':
          icon = <FaGamepad key={index} title="PC" />;
          break;
        case 'playstation':
          icon = <FaGamepad key={index} title="PlayStation" />;
          break;
        case 'xbox':
          icon = <FaGamepad key={index} title="Xbox" />;
          break;
        case 'nintendo':
          icon = <FaGamepad key={index} title="Nintendo" />;
          break;
        case 'mobile':
          icon = <FaGamepad key={index} title="Mobile" />;
          break;
        default:
          icon = <FaGamepad key={index} title={platform} />;
      }
      return icon;
    });
  };

  // Format the genres for display
  const displayGenres = () => {
    if (!game.genres || game.genres.length === 0) return 'Uncategorized';
    return game.genres.slice(0, 3).join(', ') + 
      (game.genres.length > 3 ? '...' : '');
  };

  return (
    <div className="game-card">
      {/* Cover image with overlay gradient */}
      <div 
        className="game-card-cover" 
        style={{ backgroundImage: `url(${game.coverImage || '/img/default-game-cover.jpg'})` }}
      >
        <div className="game-card-overlay"></div>
        
        {game.isFeatured && (
          <div className="game-featured-badge">
            Featured
          </div>
        )}
        
        {game.isTrending && (
          <div className="game-trending-badge">
            Trending
          </div>
        )}
      </div>
      
      <div className="game-card-content">
        <h3 className="game-title">{game.name}</h3>
        
        <div className="game-genres">
          {displayGenres()}
        </div>
        
        <div className="game-meta">
          <div className="game-platform-icons">
            {getPlatformIcons()}
          </div>
          
          <div className="game-rating">
            <FaStar />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="game-stats">
          <div className="game-stat">
            <FaUsers />
            <span>{game.totalPlayers.toLocaleString()} Players</span>
          </div>
          
          <div className="game-stat">
            <FaTrophy />
            <span>{game.achievements?.length || 0} Achievements</span>
          </div>
        </div>
        
        <Link to={`/games/${game.slug}`} className="view-game-btn">
          View Game
        </Link>
      </div>
    </div>
  );
};

export default GameCard;