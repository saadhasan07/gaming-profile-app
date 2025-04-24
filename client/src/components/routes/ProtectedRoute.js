import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AnimatedLoader from '../ui/AnimatedLoader';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ user, children, authVerifying = false }) => {
  const location = useLocation();
  
  // Show loading state while auth is being verified
  if (authVerifying) {
    return (
      <div className="protected-route-loading">
        <AnimatedLoader 
          type="dots" 
          color="primary" 
          text="Verifying authentication..." 
        />
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    // Remember the page user was trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If authenticated, render children
  return children;
};

export default ProtectedRoute;