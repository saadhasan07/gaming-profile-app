import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTrophy, FaGamepad, FaClock, FaFire, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Spinner from '../layout/Spinner';
import AchievementCard from './AchievementCard';
import './GameStats.css';

const GameStats = ({ userId, isOwnProfile }) => {
  const [gameStats, setGameStats] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingStats, setSyncingStats] = useState(false);
  const [showAddStats, setShowAddStats] = useState(false);
  const [statForm, setStatForm] = useState({
    game: '',
    platform: 'pc',
    statistics: {
      wins: 0,
      losses: 0,
      killDeathRatio: 0,
      playtime: 0
    }
  });

  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    fetchGameStats();
  }, [userId]);

  const fetchGameStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/gamestats`);
      setGameStats(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedGame(res.data.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error('Failed to load game stats');
    }
  };

  const handleSyncSteam = async () => {
    if (!auth.user.connectedAccounts.steam.connected) {
      toast.error('Please connect your Steam account first');
      return;
    }

    try {
      setSyncingStats(true);
      const res = await axios.post('/api/gamestats/sync/steam', {
        steamId: auth.user.connectedAccounts.steam.id
      });
      
      toast.success('Successfully synced Steam stats');
      setSyncingStats(false);
      fetchGameStats();
    } catch (err) {
      console.error(err);
      setSyncingStats(false);
      toast.error(err.response?.data?.message || 'Failed to sync Steam stats');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStatForm({
        ...statForm,
        [parent]: {
          ...statForm[parent],
          [child]: value
        }
      });
    } else {
      setStatForm({
        ...statForm,
        [name]: value
      });
    }
  };

  const handleSubmitStats = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/gamestats', statForm);
      toast.success('Game stats added successfully');
      setShowAddStats(false);
      fetchGameStats();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add game stats');
    }
  };

  const formatPlaytime = (minutes) => {
    if (!minutes) return '0h';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="game-stats-container">
      <div className="game-stats-header">
        <h2><FaGamepad /> Game Statistics</h2>
        {isOwnProfile && (
          <div className="game-stats-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddStats(!showAddStats)}
            >
              {showAddStats ? 'Cancel' : 'Add Stats'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleSyncSteam}
              disabled={syncingStats || !auth.user.connectedAccounts.steam.connected}
            >
              {syncingStats ? 'Syncing...' : 'Sync with Steam'}
            </button>
          </div>
        )}
      </div>

      {showAddStats && (
        <div className="add-stats-form">
          <h3>Add Game Statistics</h3>
          <form onSubmit={handleSubmitStats}>
            <div className="form-group">
              <label>Game</label>
              <input
                type="text"
                name="game"
                value={statForm.game}
                onChange={handleInputChange}
                required
                placeholder="Enter game name"
              />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <select
                name="platform"
                value={statForm.platform}
                onChange={handleInputChange}
                required
              >
                <option value="pc">PC</option>
                <option value="playstation">PlayStation</option>
                <option value="xbox">Xbox</option>
                <option value="nintendo">Nintendo</option>
                <option value="mobile">Mobile</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Wins</label>
              <input
                type="number"
                name="statistics.wins"
                value={statForm.statistics.wins}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Losses</label>
              <input
                type="number"
                name="statistics.losses"
                value={statForm.statistics.losses}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Kill/Death Ratio</label>
              <input
                type="number"
                name="statistics.killDeathRatio"
                value={statForm.statistics.killDeathRatio}
                onChange={handleInputChange}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Playtime (minutes)</label>
              <input
                type="number"
                name="statistics.playtime"
                value={statForm.statistics.playtime}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save Stats
            </button>
          </form>
        </div>
      )}

      {gameStats.length === 0 ? (
        <div className="no-stats">
          <p>No game statistics available.</p>
          {isOwnProfile && (
            <p>
              Add your game stats manually or connect your gaming accounts to automatically sync your stats.
            </p>
          )}
        </div>
      ) : (
        <div className="game-stats-content">
          <div className="game-list">
            <h3>Your Games</h3>
            <ul>
              {gameStats.map((stat) => (
                <li 
                  key={stat._id} 
                  className={selectedGame && selectedGame._id === stat._id ? 'active' : ''}
                  onClick={() => setSelectedGame(stat)}
                >
                  <div className="game-list-item">
                    <span className="game-name">{stat.game}</span>
                    <span className="game-platform">{stat.platform}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {selectedGame && (
            <div className="selected-game-stats">
              <div className="game-info-header">
                <h3>{selectedGame.game}</h3>
                <span className="platform-badge">{selectedGame.platform}</span>
                {selectedGame.gamertag && (
                  <span className="gamertag">Gamertag: {selectedGame.gamertag}</span>
                )}
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaClock />
                  </div>
                  <div className="stat-content">
                    <h4>Playtime</h4>
                    <p>{formatPlaytime(selectedGame.playtime)}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaTrophy />
                  </div>
                  <div className="stat-content">
                    <h4>Wins</h4>
                    <p>{selectedGame.statistics.wins || 0}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaFire />
                  </div>
                  <div className="stat-content">
                    <h4>K/D Ratio</h4>
                    <p>{selectedGame.statistics.killDeathRatio?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaChartLine />
                  </div>
                  <div className="stat-content">
                    <h4>Win Rate</h4>
                    <p>
                      {selectedGame.statistics.gamesPlayed
                        ? `${Math.round((selectedGame.statistics.wins / selectedGame.statistics.gamesPlayed) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedGame.achievements && selectedGame.achievements.length > 0 && (
                <div className="achievements-section">
                  <h3>Achievements</h3>
                  <div className="achievements-grid">
                    {selectedGame.achievements.map((achievement) => (
                      <AchievementCard
                        key={achievement._id}
                        achievement={achievement}
                        game={selectedGame.game}
                        isOwnProfile={isOwnProfile}
                        onShareSuccess={fetchGameStats}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="view-more">
                <Link to={`/leaderboard/${encodeURIComponent(selectedGame.game)}`} className="btn btn-link">
                  View Leaderboard for {selectedGame.game}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameStats;