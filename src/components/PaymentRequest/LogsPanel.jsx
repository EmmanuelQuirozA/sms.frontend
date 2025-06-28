import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import useCatalog from '../../hooks/useCatalogOptions';
import {
  MDBRow, MDBCol, MDBCard, MDBCardHeader, MDBCardBody,
  MDBSpinner, MDBIcon, MDBInput, MDBBtn, MDBTooltip,
  MDBTable, MDBTableHead, MDBTableBody, MDBContainer,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem
} from 'mdb-react-ui-kit';

export default function RequestHeader({ request, onApprove, onReject }) {
  const { t } = useTranslation();
  const { paymentRequest} = request;
    
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState(null);
  // Modal state for "Update request"
  const [isUpdateRequestModalOpen, setIsUpdateRequestModalOpen] = useState(false);
  const toggleUpdateRequestModal = () => setIsUpdateRequestModalOpen(v => !v);
  const [selectedPaymentRequestStudent, setSelectedPaymentRequestStudent] = useState(null);

  // Modal state for "Register Payment"
  const [isRegisterPaymentModalOpen, setIsRegisterPaymentModalOpen] = useState(false);
  const toggleRegisterPaymentModal = () => setIsRegisterPaymentModalOpen(v => !v);

  // Fetch catalogs
  const { data: paymentConcepts, fetchData: loadPaymentConcepts } = useCatalog('paymentConcepts');
  const { data: paymentThrough, fetchData: loadPaymentThrough } = useCatalog('paymentThrough');

  // Print handler
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: () => request?.payment_request_id
      ? `PaymentRequest-${request.payment_request_id}`
      : 'PaymentRequest',
  });

  return (
    <MDBCardHeader className="d-flex justify-content-between align-items-center">
        {/* <MDBIcon fas icon="file-invoice" className="me-2" /> */}
        <div className="d-flex align-items-center">
          <MDBIcon fas icon="receipt" className="me-2" />
          <h5 className="mb-0">{t('payment_request')} #{request.payment_request_id}</h5>
        </div>
        <MDBCol className="d-none d-md-flex justify-content-end gap-2">
          <MDBBtn
            flat="true" 
            size="sm" 
            color="light"
            rippleColor="dark"
            onClick={handlePrint}
          >
            <MDBIcon fas icon="print" className="me-1" /> {t('print')}
          </MDBBtn>
          
          <MDBBtn
            flat="true"
            size="sm"
            onClick={() => {
              setSelectedPaymentRequest(request);
              toggleUpdateRequestModal();
            }}
          >
            <MDBIcon fas icon="pen" className="cursor-pointer" />
          </MDBBtn>
          
          <MDBBtn
            flat="true"
            size="sm"
            onClick={() => {
              setSelectedPaymentRequest(request);
              // setSelectedPaymentRequestStudent(student);
              toggleRegisterPaymentModal();
              
              loadPaymentConcepts();
              loadPaymentThrough();
            }}
          >
            <MDBIcon fas icon="hand-holding-usd" className="cursor-pointer" />
          </MDBBtn>
        </MDBCol>
      <div>
        {onApprove && (
          <button className="btn btn-sm btn-success me-2" onClick={onApprove}>
            <MDBIcon fas icon="check" className="me-1" /> {t('approve')}
          </button>
        )}
        {onReject && (
          <button className="btn btn-sm btn-danger" onClick={onReject}>
            <MDBIcon fas icon="times" className="me-1" /> {t('reject')}
          </button>
        )}
      </div>
    </MDBCardHeader>
  );
}
