import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import StudentDetails from '../pages/StudentDetails';

export default function StudentDetailsRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          // <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
            <StudentDetails />
          // </ProtectedRoute>
        }
      />
    </Routes>
  );
}
