import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

//Publics
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';

// Admin
import AdminDashboard from './components/admin/Dashboard';
import Schools from './components/admin/Schools';
import Users from './components/admin/Users';


//School Admin
import SchoolAdminDashboard from './components/schoolAdmin/Dashboard';


//Student
import StudentDashboard from './components/student/Dashboard';

//Others, helpers and commons
import Footer from './components/common/Footer';

import NotFoundPage from './components/NotFoundPage';
import Unauthorized from './components/Unauthorized';



function App() {
  const { user } = useContext(AuthContext);
  
  return (
    <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin/dashboard" />} />
        
          {/* Protected Routes */}
            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/schools" element={<Schools />} />
              <Route path="/admin/users" element={<Users />} />
            </Route>

            {/* School Admin */}
            <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN']} />}>
              <Route path="/schooladmin/dashboard" element={<SchoolAdminDashboard />} />
            </Route>

            {/* Student */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
            </Route>

          {/* Fallback for unauthorized access */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Error handling */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      
      <Footer /> {/* Custom footer across all pages */}
    </Router>
  );
}

export default App;
