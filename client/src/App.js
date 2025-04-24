import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import GamesPage from './pages/GamesPage';
import GameDetailPage from './pages/GameDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ChatManager from './components/chat/ChatManager';
import AnimatedLoader from './components/ui/AnimatedLoader';
import ProtectedRoute from './components/routes/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  // Initialize user data and authentication
  useEffect(() => {
    const initializeAuth = async () => {
      if (authToken) {
        try {
          // Fetch user data
          const response = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // If token is invalid, clear it
            localStorage.removeItem('authToken');
            setAuthToken(null);
          }
        } catch (error) {
          console.error('Authentication error:', error);
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
  }, [authToken]);
  
  // Handle login
  const handleLogin = (token, userData) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setUser(userData);
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    localStorage.setItem('darkMode', newMode.toString());
    setDarkMode(newMode);
  };
  
  // Apply theme class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);
  
  if (loading) {
    return (
      <div className="app-loading">
        <AnimatedLoader 
          type="game" 
          size="large" 
          color="primary" 
          text="Loading Gaming Profile..." 
          fullScreen={true} 
          overlay={true}
        />
      </div>
    );
  }
  
  return (
    <Router>
      <NotificationProvider authToken={authToken}>
        <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
          <Header 
            user={user} 
            onLogout={handleLogout}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          
          <main className="app-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/login" 
                element={
                  user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  user ? <Navigate to="/dashboard" replace /> : <RegisterPage onRegister={handleLogin} />
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute user={user}>
                    <DashboardPage user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/:userId" 
                element={
                  <ProtectedRoute user={user}>
                    <ProfilePage currentUser={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/games" 
                element={
                  <ProtectedRoute user={user}>
                    <GamesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/games/:gameId" 
                element={
                  <ProtectedRoute user={user}>
                    <GameDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute user={user}>
                    <LeaderboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/events" 
                element={
                  <ProtectedRoute user={user}>
                    <EventsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/events/:eventId" 
                element={
                  <ProtectedRoute user={user}>
                    <EventDetailPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Chat and messaging (only shown when logged in) */}
          {user && authToken && (
            <ChatManager 
              authToken={authToken} 
              currentUserId={user._id}
            />
          )}
        </div>
      </NotificationProvider>
    </Router>
  );
}

export default App;