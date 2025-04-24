import React from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad, FaTwitter, FaDiscord, FaTwitch, FaGithub } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-grid">
          <div className="footer-branding">
            <Link to="/" className="footer-logo">
              <FaGamepad className="footer-icon" />
              <span>GamerStats</span>
            </Link>
            <p className="footer-description">
              Your ultimate gaming profile companion. Track stats, connect with fellow
              gamers, and climb the leaderboards.
            </p>
            <div className="social-links">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaTwitter />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaDiscord />
              </a>
              <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaTwitch />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaGithub />
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/leaderboard">Leaderboard</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h3>Resources</h3>
            <ul>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Gaming Guides</a></li>
              <li><a href="#">Game Database</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h3>Legal</h3>
            <ul>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">GDPR Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} GamerStats. All rights reserved.
          </p>
          <p className="footer-credits">
            Made with <span className="heart">❤</span> for gamers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;