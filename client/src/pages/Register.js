import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaEnvelope, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { register, user, error } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const { name, email, password, password2 } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear validation error when field is changed
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== password2) {
      errors.password2 = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Call the register method from the auth context
    const success = await register({
      name,
      email,
      password
    });
    
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
              <FaUserPlus className="auth-icon" />
              Register
            </h1>
            <p>Create your GamerStats account</p>
          </div>
          
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          <form className="auth-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                <FaUser className="input-icon" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                value={name}
                onChange={onChange}
                placeholder="Enter your full name"
              />
              {formErrors.name && (
                <div className="invalid-feedback">
                  {formErrors.name}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                value={email}
                onChange={onChange}
                placeholder="Enter your email"
              />
              {formErrors.email && (
                <div className="invalid-feedback">
                  {formErrors.email}
                </div>
              )}
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
                className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                value={password}
                onChange={onChange}
                placeholder="Enter a password"
              />
              {formErrors.password && (
                <div className="invalid-feedback">
                  {formErrors.password}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password2">
                <FaLock className="input-icon" />
                Confirm Password
              </label>
              <input
                type="password"
                id="password2"
                name="password2"
                className={`form-control ${formErrors.password2 ? 'is-invalid' : ''}`}
                value={password2}
                onChange={onChange}
                placeholder="Confirm your password"
              />
              {formErrors.password2 && (
                <div className="invalid-feedback">
                  {formErrors.password2}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                />
                <label htmlFor="terms">
                  I agree to the <Link to="/terms" className="auth-link">Terms of Service</Link> and <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-primary btn-block ${isLoading ? 'btn-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Login</Link>
            </p>
          </div>
        </div>
        
        <div className="auth-showcase">
          <div className="auth-showcase-content">
            <h2>Join the Gaming Community</h2>
            <p>Create an account to access all the features GamerStats has to offer.</p>
            <div className="showcase-features">
              <div className="showcase-feature">
                <div className="feature-check">✓</div>
                <span>Track your progress across multiple games</span>
              </div>
              <div className="showcase-feature">
                <div className="feature-check">✓</div>
                <span>Compare stats with friends and competitors</span>
              </div>
              <div className="showcase-feature">
                <div className="feature-check">✓</div>
                <span>Receive personalized improvement tips</span>
              </div>
              <div className="showcase-feature">
                <div className="feature-check">✓</div>
                <span>Showcase your achievements with a gaming profile</span>
              </div>
            </div>
          </div>
          <div className="auth-decoration"></div>
        </div>
      </div>
    </div>
  );
};

export default Register;