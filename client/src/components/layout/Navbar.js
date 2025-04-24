import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaGamepad, FaBars, FaTimes, FaTrophy, FaSignOutAlt, FaUser, FaChartBar } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <FaGamepad className="navbar-icon" />
          <span>GamerStats</span>
        </Link>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/leaderboard" className="navbar-link" onClick={closeMenu}>
              <FaTrophy className="nav-icon" />
              Leaderboard
            </Link>
          </li>
          
          {user ? (
            <>
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>
                  <FaChartBar className="nav-icon" />
                  Dashboard
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link" onClick={closeMenu}>
                  <FaUser className="nav-icon" />
                  Profile
                </Link>
              </li>
              <li className="navbar-item">
                <button className="navbar-link logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt className="nav-icon" />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link register-btn" onClick={closeMenu}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;