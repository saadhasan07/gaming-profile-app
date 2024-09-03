import React from 'react';
import Profile from '../components/Profile';
import ScoreBoard from '../components/ScoreBoard';
import Leaderboard from '../components/Leaderboard';

const HomePage = () => {
  const mockUser = { username: 'Player1', gamesPlayed: 10, highestScore: 300 };
  const mockScores = [100, 200, 150, 300];
  const mockLeaders = [
    { username: 'Player1', score: 300 },
    { username: 'Player2', score: 250 },
  ];

  return (
    <div>
      <Profile user={mockUser} />
      <ScoreBoard scores={mockScores} />
      <Leaderboard leaders={mockLeaders} />
    </div>
  );
};

export default HomePage;
