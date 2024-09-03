import React from 'react';

const ScoreBoard = ({ scores }) => {
  return (
    <div className="scoreboard">
      <h2>Scores</h2>
      <ul>
        {scores.map((score, index) => (
          <li key={index}>Game {index + 1}: {score}</li>
        ))}
      </ul>
    </div>
  );
};

export default ScoreBoard;
