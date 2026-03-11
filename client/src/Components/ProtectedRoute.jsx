/* src/components/ProtectedRoute.jsx */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * @param {string} role - 'user' or 'organizer' 
 */
const ProtectedRoute = ({ role }) => {
  const userToken = localStorage.getItem('userToken');
  const organizerToken = localStorage.getItem('organizerToken');
  const adminToken = localStorage.getItem('adminToken');

  if (role === 'user') {
    if (!userToken) {
      return <Navigate to="/login?role=user" replace />;
    }
    return <Outlet />;
  }

  if (role === 'organizer') {
    if (!organizerToken) {
      return <Navigate to="/login?role=organizer" replace />;
    }
    return <Outlet />;
  }

  if (role === 'admin') {
    if (!adminToken) {
      return <Navigate to="/login?role=admin" replace />;
    }
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
