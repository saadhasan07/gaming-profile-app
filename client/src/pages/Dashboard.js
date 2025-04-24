import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChartArea, FaTrophy, FaGamepad, FaUserFriends, FaArrowUp, FaArrowDown, FaEllipsisH } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// Sample data - In real app, this would come from API
const sampleStats = {
  totalGames: 6,
  totalMatchesPlayed: 247,
  winRate: 58.3,
  killDeathRatio: 1.78,
  totalAchievements: 32,
  recentActivity: [
    { id: 1, game: 'Apex Legends', action: 'Won a match', time: '2 hours ago', points: 25 },
    { id: 2, game: 'Call of Duty: Warzone', action: 'New personal best', time: '1 day ago', points: 50 },
    { id: 3, game: 'Fortnite', action: 'Completed challenge', time: '2 days ago', points: 15 },
    { id: 4, game: 'League of Legends', action: 'Ranked win', time: '3 days ago', points: 30 }
  ],
  recentGames: [
    { id: 1, name: 'Apex Legends', hoursPlayed: 42, lastPlayed: '2 hours ago', winRate: 62, platform: 'PC' },
    { id: 2, name: 'Call of Duty: Warzone', hoursPlayed: 68, lastPlayed: '1 day ago', winRate: 54, platform: 'PC' },
    { id: 3, name: 'Fortnite', hoursPlayed: 36, lastPlayed: '2 days ago', winRate: 45, platform: 'PC' },
    { id: 4, name: 'League of Legends', hoursPlayed: 124, lastPlayed: '3 days ago', winRate: 51, platform: 'PC' },
    { id: 5, name: 'VALORANT', hoursPlayed: 56, lastPlayed: '1 week ago', winRate: 48, platform: 'PC' },
    { id: 6, name: 'Counter-Strike 2', hoursPlayed: 93, lastPlayed: '2 weeks ago', winRate: 53, platform: 'PC' }
  ],
  achievements: [
    { id: 1, name: 'First Blood', game: 'Apex Legends', description: 'First kill of the match', earned: '3 days ago', rarity: 'Common' },
    { id: 2, name: 'Victory Royale', game: 'Fortnite', description: 'Win a match', earned: '1 week ago', rarity: 'Common' },
    { id: 3, name: 'Triple Kill', game: 'League of Legends', description: 'Kill 3 enemies in quick succession', earned: '2 weeks ago', rarity: 'Uncommon' },
    { id: 4, name: 'Headshot Master', game: 'VALORANT', description: '10 headshots in a single match', earned: '1 month ago', rarity: 'Rare' }
  ],
  friends: [
    { id: 1, name: 'GamerPal1', status: 'online', game: 'Apex Legends', avatar: '' },
    { id: 2, name: 'FpsKing', status: 'online', game: 'VALORANT', avatar: '' },
    { id: 3, name: 'LegendSlayer', status: 'offline', lastSeen: '3 hours ago', avatar: '' },
    { id: 4, name: 'ProNoob', status: 'online', game: 'Fortnite', avatar: '' },
    { id: 5, name: 'GGWPMaster', status: 'offline', lastSeen: '1 day ago', avatar: '' }
  ]
};

const Dashboard = () => {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  
  // Function to handle game selection
  const handleGameSelect = (gameId) => {
    setActiveGame(gameId === activeGame ? null : gameId);
  };
  
  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1>
            <span className="welcome-message">Welcome back,</span> {user?.name || 'Gamer'}
          </h1>
          <p className="dashboard-subtitle">
            Here's an overview of your gaming activity
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card primary-stat">
            <div className="stat-card-inner">
              <div className="stat-icon">
                <FaGamepad />
              </div>
              <div className="stat-info">
                <h3>Total Games</h3>
                <div className="stat-value">{sampleStats.totalGames}</div>
                <div className="stat-subtext">Across all platforms</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="stat-icon">
                <FaChartArea />
              </div>
              <div className="stat-info">
                <h3>Matches Played</h3>
                <div className="stat-value">{sampleStats.totalMatchesPlayed}</div>
                <div className="stat-subtext">Lifetime</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="stat-icon">
                <FaTrophy />
              </div>
              <div className="stat-info">
                <h3>Win Rate</h3>
                <div className="stat-value">{sampleStats.winRate}%</div>
                <div className="stat-subtext">
                  <span className="trend positive">
                    <FaArrowUp /> 2.4%
                  </span>
                  Past month
                </div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="stat-icon">
                <FaTrophy />
              </div>
              <div className="stat-info">
                <h3>K/D Ratio</h3>
                <div className="stat-value">{sampleStats.killDeathRatio}</div>
                <div className="stat-subtext">
                  <span className="trend negative">
                    <FaArrowDown /> 0.3
                  </span>
                  Past month
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="dashboard-content">
          <div className="dashboard-main">
            {/* Recent Games */}
            <section className="dashboard-section recent-games-section">
              <div className="section-header">
                <h2>Your Games</h2>
                <Link to="/games" className="section-link">View All</Link>
              </div>
              
              <div className="games-list">
                {sampleStats.recentGames.map(game => (
                  <div 
                    key={game.id} 
                    className={`game-card ${activeGame === game.id ? 'active' : ''}`}
                    onClick={() => handleGameSelect(game.id)}
                  >
                    <div className="game-card-header">
                      <h3 className="game-name">{game.name}</h3>
                      <div className="game-badge">{game.platform}</div>
                      <button className="game-menu-btn">
                        <FaEllipsisH />
                      </button>
                    </div>
                    
                    <div className="game-stats">
                      <div className="game-stat">
                        <div className="game-stat-value">{game.hoursPlayed}h</div>
                        <div className="game-stat-label">Played</div>
                      </div>
                      <div className="game-stat">
                        <div className="game-stat-value">{game.winRate}%</div>
                        <div className="game-stat-label">Win Rate</div>
                      </div>
                      <div className="game-stat">
                        <div className="game-stat-value">{game.lastPlayed}</div>
                        <div className="game-stat-label">Last Played</div>
                      </div>
                    </div>
                    
                    {activeGame === game.id && (
                      <div className="game-actions">
                        <Link to={`/games/${game.id}`} className="btn btn-sm btn-primary">View Stats</Link>
                        <Link to={`/games/${game.id}/achievements`} className="btn btn-sm btn-secondary">Achievements</Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            
            {/* Recent Achievements */}
            <section className="dashboard-section achievements-section">
              <div className="section-header">
                <h2>Recent Achievements</h2>
                <Link to="/achievements" className="section-link">View All</Link>
              </div>
              
              <div className="achievements-list">
                {sampleStats.achievements.map(achievement => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-icon">
                      <div className={`achievement-rarity ${achievement.rarity.toLowerCase()}`}>
                        <FaTrophy />
                      </div>
                    </div>
                    <div className="achievement-info">
                      <div className="achievement-game">{achievement.game}</div>
                      <h4 className="achievement-name">{achievement.name}</h4>
                      <div className="achievement-description">{achievement.description}</div>
                      <div className="achievement-earned">Earned {achievement.earned}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            {/* Activity Feed */}
            <section className="dashboard-section activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
              </div>
              
              <div className="activity-list">
                {sampleStats.recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-game">{activity.game}</div>
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-meta">
                      <span className="activity-time">{activity.time}</span>
                      <span className="activity-points">+{activity.points} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Friends */}
            <section className="dashboard-section friends-section">
              <div className="section-header">
                <h2>Friends</h2>
                <Link to="/friends" className="section-link">View All</Link>
              </div>
              
              <div className="friends-list">
                {sampleStats.friends.map(friend => (
                  <div key={friend.id} className="friend-item">
                    <div className="friend-avatar">
                      <div className={`status-indicator ${friend.status}`}></div>
                      {/* Avatar would go here */}
                      <div className="avatar-placeholder">{friend.name.charAt(0)}</div>
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{friend.name}</div>
                      <div className="friend-status">
                        {friend.status === 'online' 
                          ? <span>Playing {friend.game}</span>
                          : <span>Last seen {friend.lastSeen}</span>
                        }
                      </div>
                    </div>
                    <div className="friend-actions">
                      <button className="friend-action-btn">
                        <FaUserFriends />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;