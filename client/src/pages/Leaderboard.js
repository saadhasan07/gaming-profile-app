import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaSearch, FaGamepad, FaFilter, FaSortAmountDown, FaUserAlt, FaSignal } from 'react-icons/fa';
import './Leaderboard.css';

// Sample data - In a real app this would come from API
const sampleLeaderboardData = {
  games: [
    { id: 1, name: 'Call of Duty: Warzone' },
    { id: 2, name: 'Apex Legends' },
    { id: 3, name: 'Fortnite' },
    { id: 4, name: 'League of Legends' },
    { id: 5, name: 'VALORANT' },
    { id: 6, name: 'Counter-Strike 2' }
  ],
  categories: [
    { id: 'wins', name: 'Total Wins' },
    { id: 'kd', name: 'K/D Ratio' },
    { id: 'score', name: 'Score' },
    { id: 'accuracy', name: 'Accuracy %' },
    { id: 'time', name: 'Time Played' }
  ],
  platforms: [
    { id: 'all', name: 'All Platforms' },
    { id: 'pc', name: 'PC' },
    { id: 'playstation', name: 'PlayStation' },
    { id: 'xbox', name: 'Xbox' },
    { id: 'switch', name: 'Nintendo Switch' },
    { id: 'mobile', name: 'Mobile' }
  ],
  timeRanges: [
    { id: 'all', name: 'All Time' },
    { id: 'season', name: 'Current Season' },
    { id: 'month', name: 'This Month' },
    { id: 'week', name: 'This Week' },
    { id: 'day', name: 'Today' }
  ],
  players: [
    { id: 1, rank: 1, username: 'ProGamer123', avatar: '', score: 12850, wins: 387, kdRatio: 4.56, accuracy: 68, timePlayed: '1,246h', platform: 'PC', trend: 'stable' },
    { id: 2, rank: 2, username: 'GameSlayer', avatar: '', score: 11920, wins: 342, kdRatio: 3.87, accuracy: 62, timePlayed: '1,103h', platform: 'PC', trend: 'up' },
    { id: 3, rank: 3, username: 'NinjaWarrior', avatar: '', score: 10640, wins: 301, kdRatio: 3.45, accuracy: 58, timePlayed: '978h', platform: 'PlayStation', trend: 'up' },
    { id: 4, rank: 4, username: 'HeadshotKing', avatar: '', score: 9870, wins: 276, kdRatio: 3.12, accuracy: 70, timePlayed: '864h', platform: 'PC', trend: 'down' },
    { id: 5, rank: 5, username: 'GamerGirl42', avatar: '', score: 9340, wins: 251, kdRatio: 2.98, accuracy: 64, timePlayed: '792h', platform: 'Xbox', trend: 'up' },
    { id: 6, rank: 6, username: 'SniperElite', avatar: '', score: 8790, wins: 223, kdRatio: 3.76, accuracy: 72, timePlayed: '731h', platform: 'PC', trend: 'down' },
    { id: 7, rank: 7, username: 'VictoryRoyale', avatar: '', score: 8250, wins: 218, kdRatio: 2.65, accuracy: 59, timePlayed: '684h', platform: 'PlayStation', trend: 'stable' },
    { id: 8, rank: 8, username: 'FragMachine', avatar: '', score: 7980, wins: 201, kdRatio: 2.87, accuracy: 61, timePlayed: '652h', platform: 'PC', trend: 'stable' },
    { id: 9, rank: 9, username: 'TacticalPlayer', avatar: '', score: 7650, wins: 188, kdRatio: 2.54, accuracy: 57, timePlayed: '621h', platform: 'Xbox', trend: 'down' },
    { id: 10, rank: 10, username: 'EpicGamer99', avatar: '', score: 7320, wins: 176, kdRatio: 2.43, accuracy: 55, timePlayed: '589h', platform: 'PC', trend: 'up' }
  ]
};

const Leaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('wins');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter the players based on search term
  const filteredPlayers = sampleLeaderboardData.players.filter(player => 
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Toggle filters visibility on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Get current game name
  const currentGame = sampleLeaderboardData.games.find(game => game.id === selectedGame)?.name || '';
  
  // Get current category name
  const currentCategory = sampleLeaderboardData.categories.find(cat => cat.id === selectedCategory)?.name || '';
  
  return (
    <div className="leaderboard-container">
      <div className="container">
        <div className="leaderboard-header">
          <div className="header-content">
            <h1 className="leaderboard-title">
              <FaTrophy className="title-icon" />
              Global Leaderboards
            </h1>
            <p className="leaderboard-subtitle">
              See how you stack up against the best players worldwide
            </p>
          </div>
          
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search players..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="filter-toggle-btn" onClick={toggleFilters}>
              <FaFilter />
              <span>Filters</span>
            </button>
          </div>
        </div>
        
        <div className={`leaderboard-filters ${showFilters ? 'show' : ''}`}>
          <div className="filter-group">
            <label className="filter-label">
              <FaGamepad className="filter-icon" />
              Game
            </label>
            <select 
              className="filter-select"
              value={selectedGame}
              onChange={(e) => setSelectedGame(Number(e.target.value))}
            >
              {sampleLeaderboardData.games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <FaSortAmountDown className="filter-icon" />
              Category
            </label>
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {sampleLeaderboardData.categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <FaSignal className="filter-icon" />
              Platform
            </label>
            <select 
              className="filter-select"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              {sampleLeaderboardData.platforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <FaSignal className="filter-icon" />
              Time Period
            </label>
            <select 
              className="filter-select"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              {sampleLeaderboardData.timeRanges.map(timeRange => (
                <option key={timeRange.id} value={timeRange.id}>{timeRange.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="current-filters">
          <span className="current-game">{currentGame}</span>
          <span className="divider">•</span>
          <span className="current-category">{currentCategory}</span>
          <span className="divider">•</span>
          <span className="current-time">{sampleLeaderboardData.timeRanges.find(time => time.id === selectedTimeRange)?.name}</span>
        </div>
        
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-column">Rank</th>
                <th className="player-column">Player</th>
                <th className="score-column">Score</th>
                <th className="stat-column">Wins</th>
                <th className="stat-column">K/D Ratio</th>
                <th className="stat-column">Accuracy</th>
                <th className="stat-column">Time Played</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map(player => (
                <tr key={player.id} className="leaderboard-row">
                  <td className="rank-column">
                    <div className={`rank-badge rank-${player.rank <= 3 ? player.rank : 'normal'}`}>
                      {player.rank}
                    </div>
                    <div className={`trend-indicator trend-${player.trend}`}>
                      {player.trend === 'up' && '▲'}
                      {player.trend === 'down' && '▼'}
                      {player.trend === 'stable' && '•'}
                    </div>
                  </td>
                  <td className="player-column">
                    <div className="player-info">
                      <div className="player-avatar">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            <FaUserAlt />
                          </div>
                        )}
                        <div className="platform-indicator">{player.platform}</div>
                      </div>
                      <Link to={`/players/${player.id}`} className="player-username">
                        {player.username}
                      </Link>
                    </div>
                  </td>
                  <td className="score-column">
                    <div className="score-value">{player.score}</div>
                  </td>
                  <td className="stat-column">{player.wins}</td>
                  <td className="stat-column">{player.kdRatio}</td>
                  <td className="stat-column">{player.accuracy}%</td>
                  <td className="stat-column">{player.timePlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPlayers.length === 0 && (
          <div className="no-results">
            <p>No players found matching your search criteria.</p>
          </div>
        )}
        
        <div className="leaderboard-pagination">
          <button className="pagination-btn" disabled>Previous</button>
          <div className="pagination-pages">
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="pagination-ellipsis">...</span>
            <button className="page-btn">10</button>
          </div>
          <button className="pagination-btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;