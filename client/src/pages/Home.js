import React from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad, FaTrophy, FaUserAlt, FaChartBar, FaArrowRight } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Dominate The <span className="text-gradient">Game</span>
            </h1>
            <p className="hero-subtitle">
              Track your gaming performance, connect with friends, and climb the global leaderboards
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/leaderboard" className="btn btn-secondary">
                View Leaderboards
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="glow-effect"></div>
            <div className="controller-container">
              <FaGamepad className="controller-icon" />
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="hero-grid"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Enhance Your Gaming Experience</h2>
            <p className="section-subtitle">
              GamerStats provides powerful tools to help you improve and showcase your gaming skills
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartBar />
              </div>
              <h3 className="feature-title">Performance Analytics</h3>
              <p className="feature-description">
                Track detailed statistics across all your games with real-time analytics and performance insights.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaTrophy />
              </div>
              <h3 className="feature-title">Global Leaderboards</h3>
              <p className="feature-description">
                Compete with players worldwide and climb the ranks in your favorite games.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaUserAlt />
              </div>
              <h3 className="feature-title">Customizable Profile</h3>
              <p className="feature-description">
                Create your unique gaming identity with customizable profiles and badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Games</h2>
            <p className="section-subtitle">
              We support a wide range of popular titles
            </p>
          </div>

          <div className="games-grid">
            <div className="game-item">
              <div className="game-overlay">
                <h4>Fortnite</h4>
                <Link to="/register" className="game-link">Track Stats</Link>
              </div>
            </div>
            <div className="game-item">
              <div className="game-overlay">
                <h4>Call of Duty: Warzone</h4>
                <Link to="/register" className="game-link">Track Stats</Link>
              </div>
            </div>
            <div className="game-item">
              <div className="game-overlay">
                <h4>League of Legends</h4>
                <Link to="/register" className="game-link">Track Stats</Link>
              </div>
            </div>
            <div className="game-item">
              <div className="game-overlay">
                <h4>Apex Legends</h4>
                <Link to="/register" className="game-link">Track Stats</Link>
              </div>
            </div>
            <div className="game-item">
              <div className="game-overlay">
                <h4>VALORANT</h4>
                <Link to="/register" className="game-link">Track Stats</Link>
              </div>
            </div>
            <div className="game-item">
              <div className="game-overlay">
                <h4>Counter-Strike 2</h4>
                <Link to="/register" className="game-link">Track Stats</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Level Up?</h2>
            <p className="cta-description">
              Join thousands of gamers using GamerStats to track, improve, and showcase their gaming skills.
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;