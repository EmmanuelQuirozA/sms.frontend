// src/DashboardRouter.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminSchools from './admin/Schools';
import SchoolAdminSchools from './schoolAdmin/Schools';
import NotFoundPage from './NotFoundPage';
import { MDBSpinner } from 'mdb-react-ui-kit';

const DashboardRouter = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <MDBSpinner role='status'>
            <span className='visually-hidden'>Loading...</span>
        </MDBSpinner>
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
