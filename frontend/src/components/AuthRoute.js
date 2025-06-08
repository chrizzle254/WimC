import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Higher-order component to protect routes
const AuthRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // If no token, redirect to the login page with the current location
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (token) {
    const decodedToken = jwtDecode(token); // Correct way to call the function
  
    // Check if the token is expired
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('token'); // Remove expired token
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // Otherwise, render the child component
  return children;
};

export default AuthRoute;