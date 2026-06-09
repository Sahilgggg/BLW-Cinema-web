import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#080a0e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Spinning reel loader */}
        <div style={{
          width: '44px',
          height: '44px',
          border: '2px solid rgba(201,146,10,0.2)',
          borderTopColor: '#c9920a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#6b5c42',
        }}>
          Loading...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
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