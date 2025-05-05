import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user'); // Check login status

  return user ? children : <Navigate to="/" />; // Redirect to login if not logged in
};

export default PrivateRoute;
