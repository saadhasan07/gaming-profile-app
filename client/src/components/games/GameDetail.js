import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaStar, 
  FaUsers, 
  FaTrophy, 
  FaGamepad, 
  FaUserPlus,
  FaChevronLeft,
  FaDesktop,
  FaPlaystation,
  FaXbox,
  FaMobile,
  FaGameConsole,
  FaChartBar,
  FaLink
} from 'react-icons/fa';
import Spinner from '../layout/Spinner';
import AchievementCard from '../profile/AchievementCard';
import GameLeaderboard from '../leaderboard/GameLeaderboard';
import './GameDetail.css';

const GameDetail = () => {
  const { slug } = useParams();
  const history = useHistory();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchGameData();
    checkAuth();
  }, [slug]);

  useEffect(() => {
    if (game && game._id) {
      fetchAchievements();
      fetchUserStats();
    }
  }, [game]);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/user');
      setIsLoggedIn(true);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  const fetchGameData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/games/${slug}`);
      setGame(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching game:', err);
      toast.error('Failed to load game data');
      setLoading(false);
      history.push('/games');
    }
  };

  const fetchAchievements = async () => {
    try {
      const res = await axios.get(`/api/games/${game._id}/achievements`);
      setAchievements(res.data.data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  const fetchUserStats = async () => {
    if (!isLoggedIn) return;
    
    try {
      const res = await axios.get(`/api/gamestats/${game.name}`);
      if (res.data.success) {
        setUserStats(res.data.data);
      }
    } catch (err) {
      // User might not have stats for this game yet
      console.log('No stats found for this game');
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'pc':
        return <FaDesktop />;
      case 'playstation':
        return <FaPlaystation />;
      case 'xbox':
        return <FaXbox />;
      case 'nintendo':
        return <FaGameConsole />;
      case 'mobile':
        return <FaMobile />;
      default:
        return <FaGamepad />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const addToFavorites = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in to add games to favorites');
      return;
    }
    
    try {
      await axios.put('/api/profile/favorite-games', {
        games: [
          {
            name: game.name,
            platform: 'pc', // Default, user can change later
            isPrimary: false
          }
        ]
      });
      
      toast.success('Added to favorites!');
    } catch (err) {
      console.error('Error adding to favorites:', err);
      toast.error('Failed to add game to favorites');
    }
  };

  if (loading) {
    return (
      <div className="game-detail-container">
        <div className="loading-container">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="game-detail-container">
        <div className="game-not-found">
          <h2>Game Not Found</h2>
          <p>The game you're looking for doesn't exist or has been removed.</p>
          <Link to="/games" className="back-btn">
            <FaChevronLeft /> Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="game-detail-container">
      <div className="game-banner" style={{ backgroundImage: `url(${game.bannerImage || game.coverImage})` }}>
        <div className="banner-overlay"></div>
        <div className="game-banner-content">
          <Link to="/games" className="back-btn">
            <FaChevronLeft /> Back to Games
          </Link>
          <h1 className="game-title">{game.name}</h1>
          <div className="game-meta">
            {game.releaseDate && (
              <div className="meta-item">
                <FaCalendarAlt />
                <span>{formatDate(game.releaseDate)}</span>
              </div>
            )}
            <div className="meta-item">
              <FaStar />
              <span>{game.rating.toFixed(1)} ({game.numberOfRatings} ratings)</span>
            </div>
            <div className="meta-item">
              <FaUsers />
              <span>{game.totalPlayers.toLocaleString()} Players</span>
            </div>
            {achievements.length > 0 && (
              <div className="meta-item">
                <FaTrophy />
                <span>{achievements.length} Achievements</span>
              </div>
            )}
          </div>
          <div className="game-platforms">
            {game.platforms.map((platform, index) => (
              <div key={index} className="platform-icon" title={platform}>
                {getPlatformIcon(platform)}
              </div>
            ))}
          </div>
          {isLoggedIn && (
            <button className="favorite-btn" onClick={addToFavorites}>
              <FaUserPlus /> Add to Favorites
            </button>
          )}
        </div>
      </div>
      
      <div className="game-tabs">
        <button 
          className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        {achievements.length > 0 && (
          <button 
            className={`tab-btn ${selectedTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setSelectedTab('achievements')}
          >
            Achievements
          </button>
        )}
        <button 
          className={`tab-btn ${selectedTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setSelectedTab('leaderboard')}
        >
          Leaderboard
        </button>
        {isLoggedIn && (
          <button 
            className={`tab-btn ${selectedTab === 'stats' ? 'active' : ''}`}
            onClick={() => setSelectedTab('stats')}
          >
            My Stats
          </button>
        )}
      </div>
      
      <div className="game-content">
        {selectedTab === 'overview' && (
          <div className="game-overview">
            <div className="overview-main">
              <div className="description-section">
                <h2>About {game.name}</h2>
                <p className="game-description">
                  {game.description || 'No description available for this game.'}
                </p>
                
                {game.genres && game.genres.length > 0 && (
                  <div className="genres-section">
                    <h3>Genres</h3>
                    <div className="genres-list">
                      {game.genres.map((genre, index) => (
                        <span key={index} className="genre-tag">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="details-section">
                <h3>Game Details</h3>
                <div className="detail-list">
                  {game.developer && (
                    <div className="detail-item">
                      <span className="detail-label">Developer:</span>
                      <span className="detail-value">{game.developer}</span>
                    </div>
                  )}
                  
                  {game.publisher && (
                    <div className="detail-item">
                      <span className="detail-label">Publisher:</span>
                      <span className="detail-value">{game.publisher}</span>
                    </div>
                  )}
                  
                  {game.releaseDate && (
                    <div className="detail-item">
                      <span className="detail-label">Release Date:</span>
                      <span className="detail-value">{formatDate(game.releaseDate)}</span>
                    </div>
                  )}
                  
                  {game.platforms && game.platforms.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Platforms:</span>
                      <span className="detail-value">
                        {game.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                
                {game.platformIds && Object.keys(game.platformIds).some(key => game.platformIds[key]) && (
                  <div className="external-links">
                    <h3>External Links</h3>
                    {game.platformIds.steam && (
                      <a 
                        href={`https://store.steampowered.com/app/${game.platformIds.steam}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="external-link steam"
                      >
                        <FaLink /> View on Steam
                      </a>
                    )}
                    
                    {game.platformIds.igdb && (
                      <a 
                        href={`https://www.igdb.com/games/${game.platformIds.igdb}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="external-link igdb"
                      >
                        <FaLink /> View on IGDB
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {game.screenshots && game.screenshots.length > 0 && (
              <div className="screenshots-section">
                <h3>Screenshots</h3>
                <div className="screenshots-grid">
                  {game.screenshots.map((screenshot, index) => (
                    <div key={index} className="screenshot">
                      <img src={screenshot} alt={`${game.name} Screenshot ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'achievements' && (
          <div className="achievements-tab">
            <h2>Achievements</h2>
            {achievements.length === 0 ? (
              <p className="no-achievements">No achievements available for this game.</p>
            ) : (
              <div className="achievements-grid">
                {achievements.map(achievement => (
                  <div key={achievement._id} className="achievement-wrapper">
                    <AchievementCard 
                      achievement={achievement} 
                      game={game.name}
                      isOwnProfile={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'leaderboard' && (
          <div className="leaderboard-tab">
            <GameLeaderboard game={game.name} />
          </div>
        )}
        
        {selectedTab === 'stats' && (
          <div className="stats-tab">
            <h2>My Stats for {game.name}</h2>
            
            {!isLoggedIn ? (
              <div className="login-prompt">
                <p>Please log in to view your stats for this game.</p>
                <Link to="/login" className="login-btn">Log In</Link>
              </div>
            ) : !userStats ? (
              <div className="no-stats">
                <p>You don't have any stats for this game yet.</p>
                <p>Play the game or add your stats manually to track your progress.</p>
                <Link to="/profile/stats" className="add-stats-btn">
                  <FaChartBar /> Add Game Stats
                </Link>
              </div>
            ) : (
              <div className="user-game-stats">
                <div className="stats-grid">
                  {userStats.statistics && Object.entries(userStats.statistics)
                    .filter(([key, value]) => value > 0 || key === 'level')
                    .map(([key, value]) => (
                      <div key={key} className="stat-card">
                        <div className="stat-name">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="stat-value">
                          {key === 'playtime' 
                            ? `${Math.floor(value / 60)}h ${value % 60}m`
                            : key === 'winRate' || key === 'accuracy'
                              ? `${value}%`
                              : value}
                        </div>
                      </div>
                    ))}
                </div>
                
                {userStats.achievements && userStats.achievements.length > 0 && (
                  <div className="user-achievements">
                    <h3>Your Achievements</h3>
                    <div className="achievements-grid">
                      {userStats.achievements.map(achievement => (
                        <div key={achievement._id} className="achievement-wrapper">
                          <AchievementCard 
                            achievement={achievement} 
                            game={game.name}
                            isOwnProfile={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;