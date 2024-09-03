import React from 'react';

const Profile = ({ user }) => {
  return (
    <div className="profile">
      <h2>{user.username}</h2>
      <p>Games Played: {user.gamesPlayed}</p>
      <p>Highest Score: {user.highestScore}</p>
    </div>
  );
};

export default Profile;
