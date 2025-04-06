import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminUsers from './admin/Users';
import SchoolAdminUsers from './schoolAdmin/Users';
import NotFoundPage from './NotFoundPage';
import { MDBSpinner } from 'mdb-react-ui-kit';

const Router = () => {
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
      return <AdminUsers />;
    case 'SCHOOL_ADMIN':
      return <SchoolAdminUsers />;
    default:
      return <NotFoundPage />;
  }
};

export default Router;
