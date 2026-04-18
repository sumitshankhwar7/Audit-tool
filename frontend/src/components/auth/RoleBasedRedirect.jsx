import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext, getRedirectPath } from '../../context/AuthContext';

/**
 * RoleBasedRedirect - Redirects user to their specific dashboard based on role
 * Used for the /dashboard path
 */
const RoleBasedRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRedirectPath(user.role)} replace />;
};

export default RoleBasedRedirect;
