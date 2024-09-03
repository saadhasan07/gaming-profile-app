import React from 'react';

const Leaderboard = ({ leaders }) => {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ol>
        {leaders.map((leader, index) => (
          <li key={index}>{leader.username} - {leader.score}</li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
