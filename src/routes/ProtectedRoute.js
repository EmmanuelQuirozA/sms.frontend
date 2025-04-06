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
  
  // Check if the user's role is included in the allowedRoles array.
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;