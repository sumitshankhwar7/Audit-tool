import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext, getRedirectPath } from "../context/AuthContext";

/**
 * ProtectedRoute - Role-based route protection
 *
 * Usage:
 * <ProtectedRoute> - requires any authenticated user
 * <ProtectedRoute allowedRoles={['admin', 'telecaller']}> - requires specific roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, check user's role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      return <Navigate to={getRedirectPath(user.role)} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
