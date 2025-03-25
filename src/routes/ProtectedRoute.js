import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  // Use "user" from the AuthContext
  const { user } = useContext(AuthContext);
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  let userRole;
  try {
    const decoded = jwtDecode(token);
    userRole = decoded.role;  // Reading the role claim
  } catch (error) {
    console.error('Invalid token:', error);
    return <Navigate to="/login" />;
  }

  // Check if allowedRoles is defined, then check if user's role is allowed.
  // Make sure that your user object has a "role" property (or update the property name accordingly)
  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(userRole.toUpperCase())) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;