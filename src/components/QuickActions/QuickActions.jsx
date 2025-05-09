import React from 'react'
import PropTypes from 'prop-types'
import {
  MDBRow, MDBCol, MDBCard, MDBCardHeader, MDBCardBody, MDBBtn, MDBIcon
} from 'mdb-react-ui-kit'

export default function QuickActions({
  showRegisterPayment,
  showAddBalance,
  showCreateUser,
  showAddStudent,
  showAddTeacher,
  showManageSchool,
  showScheduleEvent,
  onRegisterPayment,
  onRegisterBalance,
  onCreateUser,
  onAddStudent,
  onAddTeacher,
  onManageSchool,
  onScheduleEvent,
  columns
}) {
  
  const colSize = Math.floor(12 /columns);

  return (
    <MDBRow className="mb-3">
      <MDBCol md="12">
        <MDBCard className="shadow-sm">
          <MDBCardHeader>
            <MDBIcon fas icon="rocket" className="me-2" />
            Quick Access
          </MDBCardHeader>
          <MDBCardBody>
            <MDBRow className="g-3">
              {showRegisterPayment && (
                <MDBCol md={colSize} sm="6">
                  <MDBBtn color="primary" block onClick={onRegisterPayment}>
                    <MDBIcon fas icon="money-check-alt" className="me-2" />
                    Register Payment
                  </MDBBtn>
                </MDBCol>
              )}
              {showAddBalance && (
								<MDBCol md={colSize} sm="6">
									<MDBBtn color="secondary" block onClick={onRegisterBalance}>
										<MDBIcon fas icon="money-check-alt" className="me-2" />
										Add balance
									</MDBBtn>
								</MDBCol>
              )}
              {showCreateUser && (
                <MDBCol md={colSize} sm="6">
                  <MDBBtn color="success" block onClick={onCreateUser}>
                    <MDBIcon fas icon="user-plus" className="me-2" />
                    Create User
                  </MDBBtn>
                </MDBCol>
              )}
              {showAddStudent && (
                <MDBCol md={colSize} sm="6">
                  <MDBBtn color="info" block onClick={onAddStudent}>
                    <MDBIcon fas icon="user-graduate" className="me-2" />
                    Add Student
                  </MDBBtn>
                </MDBCol>
              )}
              {showAddTeacher && (
                <MDBCol md={colSize} sm="6">
                  <MDBBtn color="warning" block onClick={onAddTeacher}>
                    <MDBIcon fas icon="chalkboard-teacher" className="me-2" />
                    Add Teacher
                  </MDBBtn>
                </MDBCol>
              )}
              {showManageSchool && (
                <MDBCol md={colSize} sm="6">
                  <MDBBtn color="dark" block onClick={onManageSchool}>
                    <MDBIcon fas icon="building" className="me-2" />
                    Manage School
                  </MDBBtn>
                </MDBCol>
              )}
              {showScheduleEvent && (
                <MDBCol md={colSize} sm="6">
                  <MDBBtn color="secondary" block onClick={onScheduleEvent}>
                    <MDBIcon fas icon="calendar-alt" className="me-2" />
                    Schedule Event
                  </MDBBtn>
                </MDBCol>
              )}
            </MDBRow>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>
  )
}

QuickActions.propTypes = {
  showRegisterPayment: PropTypes.bool,
  showCreateUser:      PropTypes.bool,
  showAddStudent:      PropTypes.bool,
  showAddTeacher:      PropTypes.bool,
  showManageSchool:    PropTypes.bool,
  showScheduleEvent:   PropTypes.bool,
  onRegisterPayment:   PropTypes.func,
  onRegisterBalance:   PropTypes.func,
  onCreateUser:        PropTypes.func,
  onAddStudent:        PropTypes.func,
  onAddTeacher:        PropTypes.func,
  onManageSchool:      PropTypes.func,
  onScheduleEvent:     PropTypes.func
}

QuickActions.defaultProps = {
  showRegisterPayment: false,
  showCreateUser:      false,
  showAddStudent:      false,
  showAddTeacher:      false,
  showManageSchool:    false,
  showScheduleEvent:   false,
  onRegisterPayment:   () => {},
  onRegisterBalance:   () => {},
  onCreateUser:        () => {},
  onAddStudent:        () => {},
  onAddTeacher:        () => {},
  onManageSchool:      () => {},
  onScheduleEvent:     () => {}
}
