import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Coffee from '../pages/Coffee';

export default function CoffeeRouter() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN','SCHOOL_ADMIN','TEACHERS']}>
            <Navigate to="list" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="list" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN','SCHOOL_ADMIN','TEACHERS']}>
            <Coffee />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
