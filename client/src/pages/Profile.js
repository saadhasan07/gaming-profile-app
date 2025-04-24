import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaCog, FaTrophy, FaGamepad, FaUserFriends } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

// Sample data - In real app, this would come from API
const sampleUserData = {
  profileImage: '',
  username: 'GamerX',
  bio: 'Passionate gamer with a love for FPS and strategy games. Always looking to improve and compete at the highest level.',
  level: 42,
  xp: 8750,
  nextLevelXp: 10000,
  memberSince: 'Jan 2022',
  totalGamesPlayed: 1458,
  achievements: 87,
  badges: [
    { id: 1, name: 'Early Adopter', description: 'Joined during the beta phase', icon: '🏆' },
    { id: 2, name: 'Social Butterfly', description: 'Connected with 10+ friends', icon: '🦋' },
    { id: 3, name: 'Achievement Hunter', description: 'Earned 50+ achievements', icon: '🎯' },
    { id: 4, name: 'Gaming Veteran', description: 'Played 1000+ matches', icon: '⚔️' }
  ],
  platforms: ['PC', 'PlayStation', 'Xbox'],
  favoriteGames: [
    { id: 1, name: 'Call of Duty: Warzone', hoursPlayed: 342 },
    { id: 2, name: 'League of Legends', hoursPlayed: 568 },
    { id: 3, name: 'Apex Legends', hoursPlayed: 125 }
  ],
  recentAchievements: [
    { id: 1, name: 'Sharpshooter', game: 'Call of Duty: Warzone', date: '3 days ago' },
    { id: 2, name: 'Last One Standing', game: 'Apex Legends', date: '1 week ago' },
    { id: 3, name: 'Pentakill', game: 'League of Legends', date: '2 weeks ago' }
  ],
  stats: {
    totalWins: 724,
    winRate: '49.7%',
    kdRatio: 1.87,
    headshotPercentage: '24%',
    favoriteWeapon: 'M4A1 Assault Rifle',
    avgMatchTime: '18 min'
  }
};

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: sampleUserData.username,
    bio: sampleUserData.bio
  });
  
  // Load profile data
  useEffect(() => {
    // This would fetch from API in a real app
    // For now we're using sample data
  }, []);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Update profile through API call here
    setIsEditing(false);
    // Show success message
  };
  
  const calculateProgressPercentage = () => {
    return (sampleUserData.xp / sampleUserData.nextLevelXp) * 100;
  };
  
  return (
    <div className="profile-container">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              {sampleUserData.profileImage ? (
                <img src={sampleUserData.profileImage} alt="Profile" />
              ) : (
                <div className="profile-avatar-placeholder">
                  <FaUser />
                </div>
              )}
              <button className="avatar-edit-btn">
                <FaEdit />
              </button>
            </div>
            
            <div className="profile-info">
              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profileData.username}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="profile-edit-actions">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="profile-name-container">
                    <h1 className="profile-name">{sampleUserData.username}</h1>
                    <button className="profile-edit-btn" onClick={handleEditToggle}>
                      <FaEdit />
                    </button>
                  </div>
                  <p className="profile-bio">{sampleUserData.bio}</p>
                  <div className="profile-meta">
                    <div className="profile-level">
                      <span className="level-label">LEVEL</span>
                      <span className="level-value">{sampleUserData.level}</span>
                      <div className="level-progress-container">
                        <div 
                          className="level-progress" 
                          style={{ width: `${calculateProgressPercentage()}%` }}
                        ></div>
                      </div>
                      <span className="level-xp">
                        {sampleUserData.xp} / {sampleUserData.nextLevelXp} XP
                      </span>
                    </div>
                    <div className="profile-member-since">
                      Member since {sampleUserData.memberSince}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="profile-badges">
            {sampleUserData.badges.map(badge => (
              <div key={badge.id} className="profile-badge" title={badge.description}>
                <div className="badge-icon">{badge.icon}</div>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Profile Navigation */}
        <div className="profile-nav">
          <button 
            className={`profile-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <FaUser /> Overview
          </button>
          <button 
            className={`profile-nav-item ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => handleTabChange('games')}
          >
            <FaGamepad /> Games
          </button>
          <button 
            className={`profile-nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => handleTabChange('achievements')}
          >
            <FaTrophy /> Achievements
          </button>
          <button 
            className={`profile-nav-item ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => handleTabChange('friends')}
          >
            <FaUserFriends /> Friends
          </button>
          <button 
            className={`profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <FaCog /> Settings
          </button>
        </div>
        
        {/* Profile Content */}
        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="profile-overview">
              <div className="profile-stats-summary">
                <div className="stats-card">
                  <h3 className="stats-title">Gaming Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Total Games Played</span>
                      <span className="stat-value">{sampleUserData.totalGamesPlayed}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Wins</span>
                      <span className="stat-value">{sampleUserData.stats.totalWins}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Win Rate</span>
                      <span className="stat-value">{sampleUserData.stats.winRate}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">K/D Ratio</span>
                      <span className="stat-value">{sampleUserData.stats.kdRatio}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Headshot %</span>
                      <span className="stat-value">{sampleUserData.stats.headshotPercentage}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Favorite Weapon</span>
                      <span className="stat-value">{sampleUserData.stats.favoriteWeapon}</span>
                    </div>
                  </div>
                </div>
                
                <div className="cards-row">
                  <div className="stats-card">
                    <h3 className="stats-title">Platforms</h3>
                    <div className="platform-list">
                      {sampleUserData.platforms.map((platform, index) => (
                        <div key={index} className="platform-badge">
                          {platform}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="stats-card">
                    <h3 className="stats-title">Achievements</h3>
                    <div className="achievement-summary">
                      <div className="achievement-count">
                        {sampleUserData.achievements}
                      </div>
                      <span className="achievement-label">Total Unlocked</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="profile-recent">
                <div className="stats-card">
                  <h3 className="stats-title">Favorite Games</h3>
                  <div className="favorite-games-list">
                    {sampleUserData.favoriteGames.map(game => (
                      <div key={game.id} className="favorite-game">
                        <h4 className="favorite-game-name">{game.name}</h4>
                        <div className="favorite-game-hours">
                          {game.hoursPlayed} hours played
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="stats-card">
                  <h3 className="stats-title">Recent Achievements</h3>
                  <div className="recent-achievements-list">
                    {sampleUserData.recentAchievements.map(achievement => (
                      <div key={achievement.id} className="recent-achievement">
                        <div className="achievement-name-container">
                          <h4 className="recent-achievement-name">
                            {achievement.name}
                          </h4>
                          <div className="recent-achievement-game">
                            {achievement.game}
                          </div>
                        </div>
                        <div className="recent-achievement-date">
                          {achievement.date}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'games' && (
            <div className="profile-games">
              <h2 className="section-title">My Games</h2>
              <p>This tab would display a comprehensive list of all games the user has played with detailed statistics.</p>
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div className="profile-achievements">
              <h2 className="section-title">My Achievements</h2>
              <p>This tab would show all achievements the user has earned across different games.</p>
            </div>
          )}
          
          {activeTab === 'friends' && (
            <div className="profile-friends">
              <h2 className="section-title">My Friends</h2>
              <p>This tab would display the user's friends list and allow them to manage their connections.</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="profile-settings">
              <h2 className="section-title">Account Settings</h2>
              <p>This tab would contain account settings, privacy controls, notification preferences, etc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;