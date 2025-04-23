import React, { useContext } from 'react';
import { 
  MDBContainer, MDBSpinner
} from 'mdb-react-ui-kit';
import { AuthContext } from '../context/AuthContext';
import AdminUsers from './admin/Users';
import SchoolAdminUsers from './schoolAdmin/Users';
import NotFoundPage from './NotFoundPage';

const Router = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
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
      return <AdminUsers />;
    case 'SCHOOL_ADMIN':
      return <SchoolAdminUsers />;
    default:
      return <NotFoundPage />;
  }
};

export default Router;
