// In your ProtectedRoute component
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Show loading while auth is being determined
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Only redirect once to prevent loops
  if (!token && !user && !hasRedirected) {
    setHasRedirected(true);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have auth data, render the protected content
  if (token && user) {
    return children;
  }

  // Fallback - should not reach here
  return <Navigate to="/login" state={{ from: location }} replace />;
};

