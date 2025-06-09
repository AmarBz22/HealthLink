// src/components/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PublicRoute = ({ children, redirectTo = "/dashboard" }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is authenticated and tries to access login/signup, redirect them
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};