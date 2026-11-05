
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useUser } from '../UserContext/UserContext';

const ProtectedRoute = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="protected-route-loading"
        role="status"
      >
        Loading your Geonix account...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    const destination =
      user.role === 'instructor'
        ? '/instructor-dashboard'
        : '/dashboard';

    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
