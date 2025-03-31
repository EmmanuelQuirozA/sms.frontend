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
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBIcon,
  MDBBtn
} from 'mdb-react-ui-kit';

const SchoolAdminDashboard = () => {
  return (
    <Layout pageTitle="Dashboard">
      <MDBContainer className="py-4">
        {/* Quick Access Section */}
        <MDBRow className="mb-4">
          <MDBCol md="12">
            <MDBCard className="mb-3 shadow-sm">
              <MDBCardHeader>
                <MDBIcon fas icon="rocket" className="me-2" />
                Quick Access
              </MDBCardHeader>
              <MDBCardBody>
                <MDBRow className="g-3">
                  <MDBCol md="4" sm="6">
                    <MDBBtn color="primary" block>
                      <MDBIcon fas icon="money-check-alt" className="me-2" />
                      Register Payment
                    </MDBBtn>
                  </MDBCol>
                  <MDBCol md="4" sm="6">
                    <MDBBtn color="success" block>
                      <MDBIcon fas icon="user-plus" className="me-2" />
                      Create User
                    </MDBBtn>
                  </MDBCol>
                  <MDBCol md="4" sm="6">
                    <MDBBtn color="info" block>
                      <MDBIcon fas icon="user-graduate" className="me-2" />
                      Add Student
                    </MDBBtn>
                  </MDBCol>
                  <MDBCol md="4" sm="6">
                    <MDBBtn color="warning" block>
                      <MDBIcon fas icon="chalkboard-teacher" className="me-2" />
                      Add Teacher
                    </MDBBtn>
                  </MDBCol>
                  <MDBCol md="4" sm="6">
                    <MDBBtn color="dark" block>
                      <MDBIcon fas icon="building" className="me-2" />
                      Manage School
                    </MDBBtn>
                  </MDBCol>
                  <MDBCol md="4" sm="6">
                    <MDBBtn color="secondary" block>
                      <MDBIcon fas icon="calendar-alt" className="me-2" />
                      Schedule Event
                    </MDBBtn>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Statistic Cards */}
        <MDBRow className="mb-4">
          <MDBCol md="3">
            <MDBCard className="shadow-sm">
              <MDBCardHeader className="text-white bg-primary ">Users</MDBCardHeader>
              <MDBCardBody>
                <h3>1,234</h3>
                <p>Total Users</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="3">
            <MDBCard className="shadow-sm">
              <MDBCardHeader className="text-white bg-success">Schools</MDBCardHeader>
              <MDBCardBody>
                <h3>56</h3>
                <p>Total Schools</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="3">
            <MDBCard className="shadow-sm">
              <MDBCardHeader className="text-white bg-warning">Students</MDBCardHeader>
              <MDBCardBody>
                <h3>2,345</h3>
                <p>Total Students</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="3">
            <MDBCard className="shadow-sm">
              <MDBCardHeader className="text-white bg-danger">Alerts</MDBCardHeader>
              <MDBCardBody>
                <h3>5</h3>
                <p>System Alerts</p>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Recent Activity & Statistics Section */}
        <MDBRow className="mb-4">
          <MDBCol md="6">
            <MDBCard className="mb-3 shadow-sm">
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
                <MDBBtn color="primary" className="mt-3">
                  View All
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="6">
            <MDBCard className="mb-3 shadow-sm">
              <MDBCardHeader>
                <MDBIcon fas icon="chart-line" className="me-2" />
                Statistics
              </MDBCardHeader>
              <MDBCardBody>
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

        {/* Additional Sections */}

        {/* Calendar */}
        <MDBRow className="mb-4">
          <MDBCol md="12">
            <MDBCard className="shadow-sm mb-3">
              <MDBCardHeader className="bg-info text-white">
                <MDBIcon fas icon="calendar-alt" className="me-2" />
                Calendar
              </MDBCardHeader>
              <MDBCardBody>
                <div
                  style={{
                    height: '300px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <p className="text-muted">Calendar widget goes here</p>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Announcements & Messages */}
        <MDBRow className="mb-4">
          <MDBCol md="6">
            <MDBCard className="shadow-sm mb-3">
              <MDBCardHeader className="bg-secondary text-white">
                <MDBIcon fas icon="bullhorn" className="me-2" />
                Announcements
              </MDBCardHeader>
              <MDBCardBody>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    Announcement 1 <small>(Placeholder)</small>
                  </li>
                  <li className="list-group-item">
                    Announcement 2 <small>(Placeholder)</small>
                  </li>
                  <li className="list-group-item">
                    Announcement 3 <small>(Placeholder)</small>
                  </li>
                </ul>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="6">
            <MDBCard className="shadow-sm mb-3">
              <MDBCardHeader className="bg-primary text-white">
                <MDBIcon fas icon="comments" className="me-2" />
                Messages
              </MDBCardHeader>
              <MDBCardBody>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    Message from Admin <small>(Placeholder)</small>
                  </li>
                  <li className="list-group-item">
                    Message from Teacher <small>(Placeholder)</small>
                  </li>
                  <li className="list-group-item">
                    Message from Student <small>(Placeholder)</small>
                  </li>
                </ul>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Students with Big Debt */}
        <MDBRow className="mb-4">
          <MDBCol md="12">
            <MDBCard className="shadow-sm mb-3">
              <MDBCardHeader className="bg-danger text-white">
                <MDBIcon fas icon="exclamation-circle" className="me-2" />
                Students with Big Debt
              </MDBCardHeader>
              <MDBCardBody>
                <MDBTable responsive striped>
                  <MDBTableHead>
                    <tr>
                      <th>Name</th>
                      <th>Debt</th>
                      <th>Action</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    <tr>
                      <td>Student A</td>
                      <td>$1,200</td>
                      <td>
                        <MDBBtn size="sm" color="primary">
                          View Details
                        </MDBBtn>
                      </td>
                    </tr>
                    <tr>
                      <td>Student B</td>
                      <td>$950</td>
                      <td>
                        <MDBBtn size="sm" color="primary">
                          View Details
                        </MDBBtn>
                      </td>
                    </tr>
                    <tr>
                      <td>Student C</td>
                      <td>$1,500</td>
                      <td>
                        <MDBBtn size="sm" color="primary">
                          View Details
                        </MDBBtn>
                      </td>
                    </tr>
                  </MDBTableBody>
                </MDBTable>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </Layout>
  );
};

export default SchoolAdminDashboard;
