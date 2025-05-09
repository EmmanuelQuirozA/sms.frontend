// src/components/NoDataComponent.js
import React from 'react';
import { MDBIcon,MDBContainer,MDBSpinner } from 'mdb-react-ui-kit';

const NoDataComponent = ({ message, body }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <MDBContainer className="my-5 text-center">
      <MDBSpinner grow color="primary" />
    </MDBContainer>
  </div>
  );
};

export default NoDataComponent;
