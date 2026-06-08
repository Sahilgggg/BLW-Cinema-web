import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen bg-cinema-bg flex items-center justify-center text-white">Loading...</div>;
  }

  // If no user is logged in, send them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required (like 'admin') and the user doesn't match, send them home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;