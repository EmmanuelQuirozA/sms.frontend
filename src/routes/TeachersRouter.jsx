import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Teachers from '../pages/Teachers';

export default function TeachersRouter() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Teachers />
        } 
      />
      <Route 
        path="list" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN','SCHOOL_ADMIN','TEACHERS']}>
            <Teachers />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
