import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  // Wait until UserContext finishes checking localStorage
  if (loading) {
    return <div>Loading...</div>;
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in
  return children;
};

export default ProtectedRoute;