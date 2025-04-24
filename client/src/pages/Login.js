import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user, error } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const { email, password } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    
    // Call the login method from the auth context
    const success = await login({ email, password });
    
    setIsLoading(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>
              <FaSignInAlt className="auth-icon" />
              Login
            </h1>
            <p>Sign in to your GamerStats account</p>
          </div>
          
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          <form className="auth-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                <FaUser className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={email}
                onChange={onChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="input-icon" />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="form-group remember-me">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-primary btn-block ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Register</Link>
            </p>
          </div>
        </div>
        
        <div className="auth-showcase">
          <div className="auth-showcase-content">
            <h2>Level Up Your Gaming Experience</h2>
            <p>Track your stats, join global leaderboards, and connect with gamers worldwide.</p>
            <div className="showcase-features">
              <div className="showcase-feature">
                <div className="feature-check">✓</div>
                <span>Real-time game statistics</span>
              </div>
              <div className="showcase-feature">
                <div className="feature-check">✓</div>
                <span>Personalized performance insights</span>
              </div>
              <div className="showcase-feature">
                <div className="feature-check">✓</div>
                <span>Global and friend leaderboards</span>
              </div>
              <div className="showcase-feature">
                <div className="feature-check">✓</div>
                <span>Achievement tracking and sharing</span>
              </div>
            </div>
          </div>
          <div className="auth-decoration"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;