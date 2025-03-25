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

const StudentDashboard = () => {
  return (
    <MDBContainer fluid className="py-4">
      {/* Dashboard Header */}
      <MDBRow className="mb-4">
        <MDBCol md="12">
          <h2 className="mb-3">Student Dashboard</h2>
          <p className="text-muted">
            Your personal dashboard for tracking progress, courses, and upcoming events.
          </p>
        </MDBCol>
      </MDBRow>

      {/* Statistic Cards */}
      <MDBRow className="mb-4">
        <MDBCol md="4">
          <MDBCard className="text-white bg-primary mb-3">
            <MDBCardHeader>Courses</MDBCardHeader>
            <MDBCardBody>
              <h3>5</h3>
              <p>Enrolled Courses</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol md="4">
          <MDBCard className="text-white bg-success mb-3">
            <MDBCardHeader>Progress</MDBCardHeader>
            <MDBCardBody>
              <h3>80%</h3>
              <p>Overall Progress</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol md="4">
          <MDBCard className="text-white bg-warning mb-3">
            <MDBCardHeader>Upcoming</MDBCardHeader>
            <MDBCardBody>
              <h3>2</h3>
              <p>Upcoming Exams</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      {/* Announcements and Events Section */}
      <MDBRow>
        <MDBCol md="6">
          <MDBCard className="mb-3">
            <MDBCardHeader>
              <MDBIcon fas icon="bullhorn" className="me-2" />
              Announcements
            </MDBCardHeader>
            <MDBCardBody>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <MDBIcon fas icon="bell" className="me-2 text-primary" />
                  New assignment posted in <strong>Mathematics</strong>.
                </li>
                <li className="list-group-item">
                  <MDBIcon fas icon="clock" className="me-2 text-success" />
                  Exam schedule updated.
                </li>
                <li className="list-group-item">
                  <MDBIcon fas icon="exclamation-circle" className="me-2 text-warning" />
                  Project submission deadline is near.
                </li>
              </ul>
              <MDBBtn color="primary" size="sm" className="mt-3">
                View All Announcements
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol md="6">
          <MDBCard className="mb-3">
            <MDBCardHeader>
              <MDBIcon fas icon="calendar-alt" className="me-2" />
              Upcoming Events
            </MDBCardHeader>
            <MDBCardBody>
              {/* Placeholder for a calendar or event list */}
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
                <p className="text-muted">Calendar or event list goes here</p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default StudentDashboard;
