import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Classes from '../pages/Classes';

export default function ClassesRouter() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Classes />
        } 
      />
      <Route 
        path="list" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN','SCHOOL_ADMIN','TEACHERS']}>
            <Classes />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
