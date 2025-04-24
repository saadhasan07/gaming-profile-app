import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      
      // Check if token exists in local storage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Set default headers for all requests
      axios.defaults.headers.common['x-auth-token'] = token;
      
      try {
        const res = await axios.get('/api/auth');
        setUser(res.data);
      } catch (err) {
        // Clear invalid token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        
        setError('Session expired, please log in again');
        console.error('Auth error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register new user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/users', formData);
      
      // Save token and set headers
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Load user data
      const userRes = await axios.get('/api/auth');
      setUser(userRes.data);
      
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Registration failed';
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth', formData);
      
      // Save token and set headers
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Load user data
      const userRes = await axios.get('/api/auth');
      setUser(userRes.data);
      
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Invalid credentials';
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    
    // Remove token from axios headers
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Clear user in state
    setUser(null);
    
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};