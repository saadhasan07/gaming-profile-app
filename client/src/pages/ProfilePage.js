import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaGamepad, 
  FaStar, 
  FaPalette, 
  FaUserFriends, 
  FaCalendarAlt, 
  FaShareAlt, 
  FaUserEdit, 
  FaEnvelope,
  FaUserPlus,
  FaUserMinus,
  FaUserClock
} from 'react-icons/fa';
import Spinner from '../components/layout/Spinner';
import GameStats from '../components/profile/GameStats';
import ThemeCustomizer from '../components/profile/ThemeCustomizer';
import './ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('profile');
  const auth = useSelector((state) => state.auth);
  const isOwnProfile = auth.user && 
    ((!username && auth.isAuthenticated) || 
    (username && auth.user.username === username));
  
  useEffect(() => {
    fetchProfile();
  }, [username, auth.isAuthenticated]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // If no username is provided and user is authenticated, get current user's profile
      const endpoint = username ? `/api/profile/${username}` : '/api/profile';
      
      const res = await axios.get(endpoint);
      setProfile(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error(err.response?.data?.message || 'Failed to load profile');
      setLoading(false);
    }
  };
  
  const handleFriendRequest = async () => {
    if (!auth.isAuthenticated) {
      toast.info('Please login to send friend requests');
      return;
    }
    
    try {
      const res = await axios.post(`/api/friends/request/${profile._id}`);
      toast.success('Friend request sent!');
      
      // Update profile state with new friendship status
      setProfile({
        ...profile,
        friendship: {
          status: 'pending',
          isPending: true
        }
      });
    } catch (err) {
      console.error('Error sending friend request:', err);
      toast.error(err.response?.data?.message || 'Failed to send friend request');
    }
  };
  
  const handleCancelRequest = async () => {
    try {
      const res = await axios.delete(`/api/friends/request/${profile._id}`);
      toast.success('Friend request cancelled');
      
      // Update profile state with new friendship status
      setProfile({
        ...profile,
        friendship: null
      });
    } catch (err) {
      console.error('Error cancelling friend request:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel friend request');
    }
  };
  
  const handleAcceptRequest = async () => {
    try {
      const res = await axios.post(`/api/friends/accept/${profile._id}`);
      toast.success('Friend request accepted');
      
      // Update profile state with new friendship status
      setProfile({
        ...profile,
        friendship: {
          status: 'accepted',
          since: new Date().toISOString(),
          isPending: false
        }
      });
    } catch (err) {
      console.error('Error accepting friend request:', err);
      toast.error(err.response?.data?.message || 'Failed to accept friend request');
    }
  };
  
  const handleUnfriend = async () => {
    try {
      const res = await axios.delete(`/api/friends/${profile._id}`);
      toast.success('Friend removed');
      
      // Update profile state with new friendship status
      setProfile({
        ...profile,
        friendship: null
      });
    } catch (err) {
      console.error('Error removing friend:', err);
      toast.error(err.response?.data?.message || 'Failed to remove friend');
    }
  };
  
  const getFriendshipButton = () => {
    if (!auth.isAuthenticated || isOwnProfile) {
      return null;
    }
    
    if (!profile.friendship) {
      return (
        <button className="friendship-btn add-friend" onClick={handleFriendRequest}>
          <FaUserPlus /> Add Friend
        </button>
      );
    }
    
    if (profile.friendship.status === 'pending') {
      if (profile.friendship.isPending) {
        return (
          <button className="friendship-btn cancel-request" onClick={handleCancelRequest}>
            <FaUserClock /> Cancel Request
          </button>
        );
      } else {
        return (
          <button className="friendship-btn accept-request" onClick={handleAcceptRequest}>
            <FaUserPlus /> Accept Request
          </button>
        );
      }
    }
    
    if (profile.friendship.status === 'accepted') {
      return (
        <button className="friendship-btn unfriend" onClick={handleUnfriend}>
          <FaUserMinus /> Unfriend
        </button>
      );
    }
    
    return null;
  };
  
  const getProfileActions = () => {
    if (isOwnProfile) {
      return (
        <div className="profile-actions">
          <Link to="/profile/edit" className="profile-action-btn edit">
            <FaUserEdit /> Edit Profile
          </Link>
        </div>
      );
    }
    
    return (
      <div className="profile-actions">
        {getFriendshipButton()}
        
        {(auth.isAuthenticated && profile.friendship?.status === 'accepted') && (
          <Link to={`/messages/user/${profile._id}`} className="profile-action-btn message">
            <FaEnvelope /> Message
          </Link>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="loading-container">
          <Spinner />
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="profile-page-container">
        <div className="profile-not-found">
          <h2>Profile Not Found</h2>
          <p>The profile you're looking for doesn't exist or is not accessible.</p>
          <Link to="/" className="back-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-page-container">
      <div className="profile-banner" style={{ backgroundImage: `url(${profile.bannerImage})` }}>
        <div className="banner-overlay"></div>
      </div>
      
      <div className="profile-header">
        <div className="profile-avatar" style={{ backgroundImage: `url(${profile.profileImage})` }}>
          {profile.isOnline && <div className="online-indicator"></div>}
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">
            {profile.displayName || profile.username}
            {profile.status !== 'active' && (
              <span className={`profile-status status-${profile.status}`}>
                {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
              </span>
            )}
          </h1>
          
          {profile.username !== profile.displayName && (
            <div className="profile-username">@{profile.username}</div>
          )}
          
          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}
          
          <div className="profile-meta">
            {profile.location && (
              <div className="profile-location">
                📍 {profile.location}
              </div>
            )}
            
            <div className="profile-member-since">
              🕒 Member since {new Date(profile.createdAt).toLocaleDateString()}
            </div>
            
            {profile.lastActive && (
              <div className="profile-last-active">
                {profile.isOnline 
                  ? '🟢 Online now' 
                  : `🕒 Last active ${new Date(profile.lastActive).toLocaleDateString()}`}
              </div>
            )}
          </div>
          
          {getProfileActions()}
        </div>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${selectedTab === 'profile' ? 'active' : ''}`}
          onClick={() => setSelectedTab('profile')}
        >
          <FaUser /> Profile
        </button>
        
        <button 
          className={`tab-btn ${selectedTab === 'games' ? 'active' : ''}`}
          onClick={() => setSelectedTab('games')}
        >
          <FaGamepad /> Game Stats
        </button>
        
        <button 
          className={`tab-btn ${selectedTab === 'friends' ? 'active' : ''}`}
          onClick={() => setSelectedTab('friends')}
        >
          <FaUserFriends /> Friends
        </button>
        
        <button 
          className={`tab-btn ${selectedTab === 'events' ? 'active' : ''}`}
          onClick={() => setSelectedTab('events')}
        >
          <FaCalendarAlt /> Events
        </button>
        
        <button 
          className={`tab-btn ${selectedTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setSelectedTab('achievements')}
        >
          <FaStar /> Achievements
        </button>
        
        {isOwnProfile && (
          <button 
            className={`tab-btn ${selectedTab === 'theme' ? 'active' : ''}`}
            onClick={() => setSelectedTab('theme')}
          >
            <FaPalette /> Theme
          </button>
        )}
      </div>
      
      <div className="profile-content">
        {selectedTab === 'profile' && (
          <div className="profile-overview">
            <div className="profile-section">
              <h2 className="section-title">About</h2>
              <div className="profile-about">
                <p>{profile.bio || 'No bio provided'}</p>
              </div>
            </div>
            
            {profile.favoriteGames && profile.favoriteGames.length > 0 && (
              <div className="profile-section">
                <h2 className="section-title">Favorite Games</h2>
                <div className="favorite-games-grid">
                  {profile.favoriteGames.map((game, index) => (
                    <div key={index} className="favorite-game">
                      <div className="favorite-game-info">
                        <div className="favorite-game-name">{game.name}</div>
                        <div className="favorite-game-platform">{game.platform}</div>
                      </div>
                      {game.isPrimary && (
                        <div className="primary-badge">Primary</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {profile.social && Object.values(profile.social).some(link => link) && (
              <div className="profile-section">
                <h2 className="section-title">Social Links</h2>
                <div className="social-links">
                  {profile.social.twitter && (
                    <a 
                      href={`https://twitter.com/${profile.social.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link twitter"
                    >
                      Twitter
                    </a>
                  )}
                  
                  {profile.social.twitch && (
                    <a 
                      href={`https://twitch.tv/${profile.social.twitch}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link twitch"
                    >
                      Twitch
                    </a>
                  )}
                  
                  {profile.social.youtube && (
                    <a 
                      href={profile.social.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link youtube"
                    >
                      YouTube
                    </a>
                  )}
                  
                  {profile.social.discord && (
                    <div className="social-link discord">
                      Discord: {profile.social.discord}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {profile.connectedAccounts && Object.values(profile.connectedAccounts).some(acc => acc.connected) && (
              <div className="profile-section">
                <h2 className="section-title">Connected Gaming Accounts</h2>
                <div className="connected-accounts">
                  {profile.connectedAccounts.steam?.connected && (
                    <div className="connected-account steam">
                      Steam
                    </div>
                  )}
                  
                  {profile.connectedAccounts.xbox?.connected && (
                    <div className="connected-account xbox">
                      Xbox
                    </div>
                  )}
                  
                  {profile.connectedAccounts.playstation?.connected && (
                    <div className="connected-account playstation">
                      PlayStation
                    </div>
                  )}
                  
                  {profile.connectedAccounts.nintendo?.connected && (
                    <div className="connected-account nintendo">
                      Nintendo
                    </div>
                  )}
                  
                  {profile.connectedAccounts.battlenet?.connected && (
                    <div className="connected-account battlenet">
                      Battle.net
                    </div>
                  )}
                  
                  {profile.connectedAccounts.epic?.connected && (
                    <div className="connected-account epic">
                      Epic Games
                    </div>
                  )}
                  
                  {profile.connectedAccounts.riot?.connected && (
                    <div className="connected-account riot">
                      Riot Games
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'games' && (
          <GameStats userId={profile._id} isOwnProfile={isOwnProfile} />
        )}
        
        {selectedTab === 'friends' && (
          <div className="profile-friends">
            <h2 className="section-title">Friends</h2>
            
            {/* Friends list would be implemented here */}
            <div className="coming-soon">
              <p>Friends list coming soon!</p>
            </div>
          </div>
        )}
        
        {selectedTab === 'events' && (
          <div className="profile-events">
            <h2 className="section-title">
              {isOwnProfile ? 'My Events' : `${profile.displayName || profile.username}'s Events`}
            </h2>
            
            {/* Events list would be implemented here */}
            <div className="coming-soon">
              <p>Events list coming soon!</p>
            </div>
          </div>
        )}
        
        {selectedTab === 'achievements' && (
          <div className="profile-achievements">
            <h2 className="section-title">Achievements</h2>
            
            {profile.achievements && profile.achievements.length > 0 ? (
              <div className="achievements-grid">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-header">
                      <div className="achievement-game">{achievement.game}</div>
                      <div className={`achievement-rarity ${achievement.rarity}`}>
                        {achievement.rarity}
                      </div>
                    </div>
                    <div className="achievement-name">{achievement.name}</div>
                    {achievement.description && (
                      <div className="achievement-description">{achievement.description}</div>
                    )}
                    <div className="achievement-date">
                      Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </div>
                    {isOwnProfile && !achievement.isShared && (
                      <button className="share-achievement-btn">
                        <FaShareAlt /> Share
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-achievements">
                <p>No achievements unlocked yet.</p>
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'theme' && isOwnProfile && (
          <ThemeCustomizer />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;