// src/DashboardRouter.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminSchools from './admin/Schools';
import SchoolAdminSchools from './schoolAdmin/Schools';
import NotFoundPage from './NotFoundPage';
import { MDBSpinner, MDBContainer } from 'mdb-react-ui-kit';

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
      return <AdminSchools />;
    case 'SCHOOL_ADMIN':
      return <SchoolAdminSchools />;
    default:
      return <NotFoundPage />;
  }
};

export default DashboardRouter;
