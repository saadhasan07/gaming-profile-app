import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrophy, FaMedal, FaChartLine, FaStar, FaGamepad, FaFilter } from 'react-icons/fa';
import Spinner from '../layout/Spinner';
import './GameLeaderboard.css';

const GameLeaderboard = ({ game, platform, statType = 'wins', limit = 10 }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    game: game || '',
    platform: platform || '',
    statType: statType || 'wins',
    limit: limit || 10
  });
  const [games, setGames] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchGames();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (game !== filters.game || platform !== filters.platform || statType !== filters.statType) {
      setFilters({
        ...filters,
        game: game || filters.game,
        platform: platform || filters.platform,
        statType: statType || filters.statType
      });
    }
  }, [game, platform, statType]);

  const fetchGames = async () => {
    try {
      const res = await axios.get('/api/games');
      setGames(res.data.data);
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = {
        platform: filters.platform,
        stat: filters.statType,
        limit: filters.limit
      };

      const endpoint = filters.game 
        ? `/api/gamestats/leaderboard/${encodeURIComponent(filters.game)}`
        : '/api/leaderboard';

      const res = await axios.get(endpoint, { params });
      setLeaderboard(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      toast.error('Failed to load leaderboard data');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchLeaderboard();
  };

  const getStatName = () => {
    switch (filters.statType) {
      case 'wins':
        return 'Wins';
      case 'killDeathRatio':
        return 'K/D Ratio';
      case 'kills':
        return 'Kills';
      case 'highestScore':
        return 'High Score';
      case 'winRate':
        return 'Win Rate';
      case 'playtime':
        return 'Playtime';
      case 'level':
        return 'Level';
      case 'experiencePoints':
        return 'XP';
      default:
        return 'Score';
    }
  };

  const formatStatValue = (value, type) => {
    switch (type) {
      case 'killDeathRatio':
        return parseFloat(value).toFixed(2);
      case 'winRate':
        return `${Math.round(value)}%`;
      case 'playtime':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      default:
        return value.toLocaleString();
    }
  };

  const getMedalIcon = (index) => {
    switch (index) {
      case 0:
        return <FaTrophy className="medal gold" />;
      case 1:
        return <FaMedal className="medal silver" />;
      case 2:
        return <FaMedal className="medal bronze" />;
      default:
        return <span className="rank-number">{index + 1}</span>;
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="game-leaderboard">
      <div className="leaderboard-header">
        <h2>
          <FaChartLine /> 
          {filters.game ? `${filters.game} Leaderboard` : 'Global Leaderboard'}
        </h2>
        <button 
          className="filter-toggle-btn"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          title="Filter Options"
        >
          <FaFilter /> {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {isFilterOpen && (
        <div className="leaderboard-filters">
          <form onSubmit={handleApplyFilters}>
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="game">Game</label>
                <input
                  type="text"
                  id="game"
                  name="game"
                  value={filters.game}
                  onChange={handleFilterChange}
                  placeholder="Enter game name"
                  list="game-list"
                />
                <datalist id="game-list">
                  {games.map(game => (
                    <option key={game._id} value={game.name} />
                  ))}
                </datalist>
              </div>

              <div className="filter-group">
                <label htmlFor="platform">Platform</label>
                <select
                  id="platform"
                  name="platform"
                  value={filters.platform}
                  onChange={handleFilterChange}
                >
                  <option value="">All Platforms</option>
                  <option value="pc">PC</option>
                  <option value="playstation">PlayStation</option>
                  <option value="xbox">Xbox</option>
                  <option value="nintendo">Nintendo</option>
                  <option value="mobile">Mobile</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="statType">Ranking By</label>
                <select
                  id="statType"
                  name="statType"
                  value={filters.statType}
                  onChange={handleFilterChange}
                >
                  <option value="wins">Wins</option>
                  <option value="killDeathRatio">K/D Ratio</option>
                  <option value="kills">Kills</option>
                  <option value="highestScore">High Score</option>
                  <option value="winRate">Win Rate</option>
                  <option value="playtime">Playtime</option>
                  <option value="level">Level</option>
                  <option value="experiencePoints">XP</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="limit">Show Top</label>
                <select
                  id="limit"
                  name="limit"
                  value={filters.limit}
                  onChange={handleFilterChange}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <div className="filter-actions">
                <button type="submit" className="filter-apply-btn">
                  Apply Filters
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="leaderboard-info">
        <div className="stat-info">
          <FaStar className="stat-icon" />
          <div className="stat-text">
            <h3>Ranking By</h3>
            <p>{getStatName()}</p>
          </div>
        </div>

        {filters.platform && (
          <div className="platform-info">
            <FaGamepad className="platform-icon" />
            <div className="platform-text">
              <h3>Platform</h3>
              <p>{filters.platform.charAt(0).toUpperCase() + filters.platform.slice(1)}</p>
            </div>
          </div>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="no-data">
          <p>No leaderboard data available for these criteria.</p>
          <p>Try different filters or check back later.</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header-row">
            <div className="rank-column">Rank</div>
            <div className="player-column">Player</div>
            <div className="stat-column">{getStatName()}</div>
          </div>

          {leaderboard.map((entry, index) => (
            <div key={index} className={`leaderboard-row ${index < 3 ? `top-${index + 1}` : ''}`}>
              <div className="rank-column">
                {getMedalIcon(index)}
              </div>
              <div className="player-column">
                <Link to={`/profile/${entry.user.username}`} className="player-link">
                  <div className="player-avatar" style={{ backgroundImage: `url(${entry.user.profileImage})` }}></div>
                  <div className="player-info">
                    <div className="player-name">{entry.user.username}</div>
                    {entry.gamertag && <div className="player-gamertag">{entry.gamertag}</div>}
                  </div>
                </Link>
              </div>
              <div className="stat-column">
                <div className="stat-value">
                  {formatStatValue(entry.value, filters.statType)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameLeaderboard;