import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext/UserContext';

const PrivateRoute = ({ children }) => {
  const { user } = useUser();

  return user ? children : <Navigate to="/" />;
};

export default PrivateRoute;