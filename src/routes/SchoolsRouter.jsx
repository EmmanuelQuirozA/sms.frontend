import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Schools from '../pages/Schools';

export default function SchoolsRouter() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Schools />
        } 
      />
      <Route 
        path="list" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN','SCHOOL_ADMIN','TEACHERS']}>
            <Schools />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
