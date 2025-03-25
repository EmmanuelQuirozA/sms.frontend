// src/components/admin/Dashboard.js
import React from 'react';
import Layout from '../../components/Layout';
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

const AdminDashboard = () => {
  return (
    <Layout pageTitle={"Home page"}>
      <MDBContainer className="py-4">

        {/* Statistic Cards */}
        <MDBRow className="mb-4">
          <MDBCol md="3">
            <MDBCard className="text-white bg-primary mb-3">
              <MDBCardHeader>Users</MDBCardHeader>
              <MDBCardBody>
                <h3>1,234</h3>
                <p>Total Users</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="3">
            <MDBCard className="text-white bg-success mb-3">
              <MDBCardHeader>Schools</MDBCardHeader>
              <MDBCardBody>
                <h3>56</h3>
                <p>Total Schools</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="3">
            <MDBCard className="text-white bg-warning mb-3">
              <MDBCardHeader>Students</MDBCardHeader>
              <MDBCardBody>
                <h3>2,345</h3>
                <p>Total Students</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="3">
            <MDBCard className="text-white bg-danger mb-3">
              <MDBCardHeader>Alerts</MDBCardHeader>
              <MDBCardBody>
                <h3>5</h3>
                <p>System Alerts</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Recent Activity and Statistics Section */}
        <MDBRow>
          <MDBCol md="6">
            <MDBCard className="mb-3">
              <MDBCardHeader>
                <MDBIcon fas icon="history" className="me-2" />
                Recent Activity
              </MDBCardHeader>
              <MDBCardBody>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <MDBIcon fas icon="user-plus" className="me-2 text-primary" />
                    New user registered: <strong>John Doe</strong>
                  </li>
                  <li className="list-group-item">
                    <MDBIcon fas icon="school" className="me-2 text-success" />
                    School <strong>ABC Academy</strong> updated its profile.
                  </li>
                  <li className="list-group-item">
                    <MDBIcon fas icon="exclamation-triangle" className="me-2 text-warning" />
                    Alert: System maintenance scheduled.
                  </li>
                </ul>
                <MDBBtn>Button</MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="6">
            <MDBCard className="mb-3">
              <MDBCardHeader>
                <MDBIcon fas icon="chart-line" className="me-2" />
                Statistics
              </MDBCardHeader>
              <MDBCardBody>
                {/* Placeholder for a chart or graph */}
                <div style={{ height: '250px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <p className="text-muted">Chart or graph goes here</p>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </Layout>
  );
};

export default AdminDashboard;
