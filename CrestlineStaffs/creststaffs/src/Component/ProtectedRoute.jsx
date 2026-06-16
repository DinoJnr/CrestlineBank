import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if our secure crestline token exists in localStorage
  const isAuthenticated = localStorage.getItem("staffcrestline_token");

  // If NOT authenticated, immediately bounce them to the login screen
  if (!isAuthenticated) {
    return <Navigate to="/staff-login" replace />;
  }

  // If authenticated, render the page they were trying to access
  return children;
};

export default ProtectedRoute;