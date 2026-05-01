import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — A route wrapper that enforces authentication and role-based access.
 * 
 * @param {React.ReactNode} children - The page component to render if authorized.
 * @param {string} requireRole - Optional role requirement (e.g., 'grandmaster').
 *   If specified, the user must have this exact role to access the page.
 */
const ProtectedRoute = ({ children, requireRole }) => {
  const { user } = useAuth();

  // Not logged in at all — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but doesn't have the required role — redirect to home
  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  // All checks passed — render the protected page
  return children;
};

export default ProtectedRoute;
