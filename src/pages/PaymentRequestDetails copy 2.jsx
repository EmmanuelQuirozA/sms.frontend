// src/pages/PaymentRequestDetailsPage.jsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useParams } from 'react-router-dom';
import { useTranslation }   from 'react-i18next';
import usePaymentRequestDetails from '../hooks/usePaymentRequestDetails';
import RequestHeader from '../components/PaymentRequest/RequestHeader';
import StudentInfoCard from '../components/PaymentRequest/StudentInfoCard';
import RequestInfoCard from '../components/PaymentRequest/RequestInfoCard';
import PaymentsBreakdownTable from '../components/PaymentRequest/PaymentsBreakdownTable';
import LoadingComponent from '../components/common/LoadingComponent';
import usePaymentRequestLogs from '../hooks/usePaymentRequestLogs';
import FormModal from '../components/common/FormModal';
// import { Spinner } from '../components/common/Spinner';
import {  
  MDBRow, MDBCol, MDBCard, MDBCardHeader, MDBCardBody,
  MDBSpinner, MDBIcon, MDBInput, MDBBtn, MDBTooltip,
  MDBTable, MDBTableHead, MDBTableBody, MDBContainer,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem } from 'mdb-react-ui-kit';
import { formatDate } from '../utils/formatDate';

export default function PaymentRequestDetailsPage() {
  const { i18n, t } = useTranslation();
  const { payment_request_id } = useParams();

  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState(null);

  // Modal state for "Update request settings"
  const [isUpdateSettingsModalOpen, setIsUpdateSettingsModalOpen] = useState(false);
  const toggleUpdateSettingsModal = () => setIsUpdateSettingsModalOpen(v => !v);
  
  // Fetch paymentRequest
  const {
    paymentRequest:requestData,
    loading: isDetailsLoading,
    error
  } = usePaymentRequestDetails(payment_request_id);

  // Fetch paymentRequest logs
  const { logs, loading:logsLoading, error:logsError, reload:logsReload } = usePaymentRequestLogs(payment_request_id, i18n.language);

  if (isDetailsLoading || logsLoading) {
    return (
      <Layout pageTitle={t('payment_request_details')}>
        <LoadingComponent />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle={t('payment_request_details')}>
        <p className="text-danger">{error}</p>
      </Layout>
    );
  }

  const { student, paymentRequest, paymentInfo, breakdown } = requestData;

  // Style for each group
	const groupStyle = {
		borderBottom: '1px solid rgb(228 228 228)',
		marginBottom: '1.5rem'
	};
  const SettingsCard = (
    isDetailsLoading ? 
    <MDBCard className="shadow-sm border-0 mb-3">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
        <MDBContainer className="my-5 text-center">
          <MDBSpinner grow color="primary" />
        </MDBContainer>
      </div>
    </MDBCard>
    :
    <MDBCard className="shadow-sm border-0 mb-3">
      <MDBCardHeader className="bg-white d-flex justify-content-between align-items-center border-bottom">
        <div className="d-flex align-items-center">
          <MDBIcon fas icon="wrench" className="me-2" />
          <h4 className="mb-0">{t("settings")}</h4> 
        </div>
        {/* ── Desktop: show button inline ── */}
        <div className="d-none d-md-block">
          <MDBBtn flat="true" size="sm" 
            onClick={() => {
              setSelectedPaymentRequest(paymentRequest);
              toggleUpdateSettingsModal();
            }}
          >
            <MDBIcon fas icon="pen" />
          </MDBBtn>
        </div>

        {/* ── Mobile: show a dropdown instead ── */}
        <div className="d-block d-md-none">
          <MDBDropdown>
            <MDBDropdownToggle tag="button" className="btn btn-light btn-sm"></MDBDropdownToggle>
            <MDBDropdownMenu>
              <MDBDropdownItem className='p-1' onClick={() => {
                setSelectedPaymentRequest(paymentRequest);
                toggleUpdateSettingsModal();
              }}>
                {t('edit')}
              </MDBDropdownItem>
            </MDBDropdownMenu>
          </MDBDropdown>
        </div>
      </MDBCardHeader>
      <MDBCardBody>
        <div style={groupStyle}>
          <MDBRow>
            {/* Late Fee */}
            <MDBCol md="12" className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <MDBIcon fas icon="clock" className="me-2 text-secondary" />
                  <span className="mb-0">{t("late_fee")}:</span>
                </div>
                <strong>{paymentRequest.late_fee ?? "N/A"}</strong>
              </div>
            </MDBCol>
            {/* Fee Type */}
            <MDBCol md="12" className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <MDBIcon fas icon="tag" className="me-2 text-secondary" />
                  <span className="mb-0">{t("fee_type")}:</span>
                </div>
                <strong>{paymentRequest.fee_type ?? "N/A"}</strong>
              </div>
            </MDBCol>
            {/* Late Fee Frequency */}
            <MDBCol md="12" className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <MDBIcon fas icon="sync-alt" className="me-2 text-secondary" />
                  <span className="mb-0">{t("late_fee_frequency")}:</span>
                </div>
                <strong>{paymentRequest.late_fee_frequency ?? "N/A"}</strong>
              </div>
            </MDBCol>
            {/* Partial Payment */}
            <MDBCol md="12" className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <MDBIcon fas icon="code-branch" className="me-2 text-secondary" />
                  <span className="mb-0">{t("partial_payment")}:</span>
                </div>
                <strong
                  className={`px-2 py-1 rounded ${
                    paymentRequest.partial_payment
                      ? "bg-success text-white"
                      : "bg-danger text-white"
                  }`}
                  style={{ display: "inline-block" }}
                >
                  {paymentRequest.partial_payment_transformed ?? "N/A"}
                </strong>
              </div>
            </MDBCol>
            {/* Mass Upload */}
            <MDBCol md="12" className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <MDBIcon fas icon="file-upload" className="me-2 text-secondary" />
                  <span className="mb-0">{t("mass_upload")}:</span>
                </div>
                <strong>{paymentRequest.mass_upload ?? "N/A"}</strong>
              </div>
            </MDBCol>
          </MDBRow>
        </div>
      </MDBCardBody>
    </MDBCard>
  );

  const LogsCard = (
    isDetailsLoading ? 
    <MDBCard className="shadow-sm border-0 mb-3">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
        <MDBContainer className="my-5 text-center">
          <MDBSpinner grow color="primary" />
        </MDBContainer>
      </div>
    </MDBCard>
    :Array.isArray(logs) && logs.length > 0 && (
      <MDBCard  className="shadow-sm border-0 mb-3">
        <MDBCardHeader className="bg-white d-flex justify-content-between align-items-center border-bottom">
          <div className="d-flex align-items-center">
            <MDBIcon fas icon="undo" className="me-2" />
            <h4 className="mb-0">{t("change_log")}</h4> 
          </div>
        </MDBCardHeader>
        <MDBCardBody
          style={{ maxHeight: '50vh', overflowY: 'auto' }}
        >
        {logs.map((log) => (
            <MDBCol key={log.updated_at} className="mb-0">
              <small key={log.payment_request_id} className="text-muted">
                {formatDate(log.updated_at, {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </small>
              <p className="fw-bold mb-0" style={{marginTop:'-7px'}}>{log.responsable_full_name}</p>
              <p className="mb-0" style={{marginTop:'-7px'}}>{log.log_type_name}:</p>
              {log.changes.map((change) => {
                const field = change.field;
                const oldVal = change.from;
                const newVal = change.to;
                const isDate = ['pay_by', 'payment_month'].includes(field);
                const isBoolean = field === 'partial_payment';

                const renderValue = (val) => {
                  if (isBoolean) return val === '1' ? t('yes') : t('no');
                  if (isDate && field === 'payment_month') return formatDate(val, { year: 'numeric', month: 'long' });
                  if (isDate)
                    return formatDate(val, {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    if (field === 'amount')
                      return("$"+val);
                  return val;
                };

                return (
                  <div key={change.updated_at} className="mb-1">
                    <strong>{t(field)}:</strong>
                    <div className="position-relative ms-3">
                      <div
                        style={{
                          position: 'absolute',
                          left: '6px',
                          top: '10px',
                          bottom: '35%',
                          width: '2px',
                          backgroundColor: '#0d6efd',
                        }}
                      />
                      <div style={{ paddingLeft: '16px' }}>
                        <div style={{ lineHeight: '1.2' }}>
                          <span className="text-muted">{t('from')}: {renderValue(oldVal)}</span> 
                        </div>
                        <div style={{ position: 'relative', lineHeight: '1.2' }}>
                          <span className="fw-bold">{t('to')}: {renderValue(newVal)}</span> 
                          <span
                            style={{
                              position: 'absolute',
                              left: '-13px',
                              top: '5px',
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#0d6efd',
                              borderRadius: '50%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </MDBCol>
          ))}
        </MDBCardBody>
      </MDBCard>
    )
  );

  return (
    <Layout pageTitle={t("payment_request_details")}>
      <div className="d-none d-md-flex" style={{gap: '1rem', alignItems: 'stretch'}}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isDetailsLoading ? <LoadingComponent /> :
          <MDBCard className="mb-4 shadow-sm">
            <RequestHeader request={{paymentRequest}} />
            <MDBCardBody className="bg-white border-bottom-0">
              <StudentInfoCard request={{student, paymentRequest}} />
              <RequestInfoCard request={{payment_request_id, paymentRequest, paymentInfo}} />
              <PaymentsBreakdownTable
                request={{ breakdown, paymentInfo }}
              />
            </MDBCardBody>
          </MDBCard>}
        </div>
        {/* RIGHT COLUMN */}
        <div
          className="d-none d-md-flex"
          style={{ width: '25%', minWidth: '250px', display: 'flex', flexDirection: 'column' }}
        > 
          {SettingsCard}

          {/* this wrapper grows to fill remaining height and scrolls */}
          {LogsCard && (
            <div
              className="overflow-auto"
              style={{
                flexGrow: 1,
                minHeight: 0    /* allow flex child to shrink below content */
              }}
            >
              {LogsCard}
            </div>
          )}
        </div>
        {/* <LogsPanel logs={logs} /> */}
      </div>
      

      <div className="d-block d-md-none">
          <RequestHeader request={{student, paymentRequest, paymentInfo}} />
      </div>

      {/* <FormModal
        open={isRegisterPaymentModalOpen}
        onClose={toggleRegisterPaymentModal}
        formGroups={registerPaymentFormGroups}
        data={selectedPaymentRequest}
        setData={setSelectedPaymentRequest}
        onSave={handleRegisterPayment}
        title={t('register_payment')}
        size="xl"
        idPrefix="registerPayment_"
        isSaving={isSaving}
      /> */}
    </Layout>
  );
}
