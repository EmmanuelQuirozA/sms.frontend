// src/components/UnauthorizedPage.js
import React from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <MDBContainer className="text-center py-5" style={{ minHeight: '80vh' }}>
      <MDBRow className="justify-content-center align-items-center">
        <MDBCol md="8">
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h1
              style={{
                fontSize: '6rem',
                color: '#dc3545',
                marginBottom: '1rem'
              }}
            >
              401
            </h1>
            <h2 className="mb-4" style={{ fontWeight: '500' }}>
              Unauthorized Access
            </h2>
            <p
              className="mb-4"
              style={{ fontSize: '1.2rem', color: '#6c757d' }}
            >
              You do not have permission to view this page.
            </p>
            <MDBBtn color="primary" onClick={handleBackHome}>
              Back to Home
            </MDBBtn>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default UnauthorizedPage;
