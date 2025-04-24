import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaGamepad } from 'react-icons/fa';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Game Over!</h1>
        <p className="error-message">
          The page you're looking for seems to have wandered off to another dimension.
        </p>
        <div className="error-buttons">
          <Link to="/" className="btn btn-primary">
            <FaHome className="btn-icon" /> Return Home
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            <FaGamepad className="btn-icon" /> Dashboard
          </Link>
        </div>
      </div>
      
      <div className="not-found-decoration">
        <div className="pixel-character"></div>
        <div className="decoration-grid"></div>
      </div>
    </div>
  );
};

export default NotFound;