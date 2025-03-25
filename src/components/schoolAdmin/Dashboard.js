import React from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBIcon,
  MDBBtn
} from 'mdb-react-ui-kit';

const SchoolAdminDashboard = () => {
  return (
    <MDBContainer fluid className="py-4">
      {/* Dashboard Header */}
      <MDBRow className="mb-4">
        <MDBCol md="12">
          <h2 className="mb-3">School Admin Dashboard</h2>
          <p className="text-muted">
            Overview of school management including teachers, classes, and student performance.
          </p>
        </MDBCol>
      </MDBRow>

      {/* Statistic Cards */}
      <MDBRow className="mb-4">
        <MDBCol md="3">
          <MDBCard className="text-white bg-info mb-3">
            <MDBCardHeader>Teachers</MDBCardHeader>
            <MDBCardBody>
              <h3>45</h3>
              <p>Total Teachers</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol md="3">
          <MDBCard className="text-white bg-success mb-3">
            <MDBCardHeader>Students</MDBCardHeader>
            <MDBCardBody>
              <h3>800</h3>
              <p>Total Students</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol md="3">
          <MDBCard className="text-white bg-warning mb-3">
            <MDBCardHeader>Classes</MDBCardHeader>
            <MDBCardBody>
              <h3>30</h3>
              <p>Total Classes</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol md="3">
          <MDBCard className="text-white bg-danger mb-3">
            <MDBCardHeader>Alerts</MDBCardHeader>
            <MDBCardBody>
              <h3>3</h3>
              <p>School Alerts</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {/* Recent Activity and Performance Section */}
      <MDBRow>
        <MDBCol md="6">
          <MDBCard className="mb-3">
            <MDBCardHeader>
              <MDBIcon fas icon="chalkboard-teacher" className="me-2" />
              Recent Teacher Activity
            </MDBCardHeader>
            <MDBCardBody>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <MDBIcon fas icon="user-plus" className="me-2 text-info" />
                  New teacher joined: <strong>Mrs. Smith</strong>
                </li>
                <li className="list-group-item">
                  <MDBIcon fas icon="book" className="me-2 text-success" />
                  Curriculum updated for Class 10.
                </li>
                <li className="list-group-item">
                  <MDBIcon fas icon="exclamation-triangle" className="me-2 text-warning" />
                  Alert: Upcoming inspection.
                </li>
              </ul>
              <MDBBtn color="info" size="sm" className="mt-3">
                View All Activity
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol md="6">
          <MDBCard className="mb-3">
            <MDBCardHeader>
              <MDBIcon fas icon="chart-bar" className="me-2" />
              Performance Statistics
            </MDBCardHeader>
            <MDBCardBody>
              {/* Placeholder for a chart or graph */}
              <div
                style={{
                  height: '250px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <p className="text-muted">Chart or graph goes here</p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default SchoolAdminDashboard;
