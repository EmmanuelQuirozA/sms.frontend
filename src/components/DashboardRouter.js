// src/DashboardRouter.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './admin/Dashboard';
import SchoolAdminDashboard from './schoolAdmin/Dashboard';
import StudentDashboard from './student/Dashboard';
import NotFoundPage from './NotFoundPage';
import { MDBSpinner,MDBContainer } from 'mdb-react-ui-kit';

const DashboardRouter = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <MDBContainer className="my-5 text-center">
          <MDBSpinner grow color="primary" />
        </MDBContainer>
      </div>
    );
  }
  
  if (!user || !user.roleName) {
    return <NotFoundPage />; // or redirect to login
  }

  switch (user.roleName) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'SCHOOL_ADMIN':
      return <SchoolAdminDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    default:
      return <NotFoundPage />;
  }
};

export default DashboardRouter;
