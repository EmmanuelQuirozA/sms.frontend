import React, { useState, useEffect }  from 'react';
import { useParams }        from 'react-router-dom';
import { useTranslation }   from 'react-i18next';
import useAuth              from '../hooks/useAuth';
import usePaymentRequestDetails from '../hooks/usePaymentRequestDetails';
import Layout               from '../components/Layout';
import FormModal from '../components/common/FormModal';
import DetailsModal from '../components/modals/DetailsModal'
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import usePaymentRequestLogs from '../hooks/usePaymentRequestLogs';
import useCreatePayment from '../hooks/useCreatePayment';
import useCatalog from '../hooks/useCatalogOptions';
import { updatePaymentRequest } from '../api/studentApi';
import { getPaymentDetail } from '../api/studentApi';
import {
  MDBRow, MDBCol, MDBCard, MDBCardHeader, MDBCardBody,
  MDBSpinner, MDBIcon, MDBInput, MDBBtn, MDBTooltip,
  MDBTable, MDBTableHead, MDBTableBody, MDBContainer,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem
} from 'mdb-react-ui-kit';
// import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import QuickActions           from '../components/QuickActions/QuickActions';
import swal from 'sweetalert';
import LinkCell from '../components/common/LinkCell';

export default function PaymentRequestDetails() {
  const { payment_request_id } = useParams();
  const { user, role } = useAuth() || {};
  const { i18n, t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Permissions
  const canRegisterPayment = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canAddBalance     = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canExport         = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canViewReport     = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canViewPayments   = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canViewRecharges  = ['admin','school_admin','finance'].includes(role?.toLowerCase());

  // New state to track the selected PR for mass students upload
  const [isSaving, setIsSaving] = useState(false);

  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState(null);
  const [selectedPaymentRequestStudent, setSelectedPaymentRequestStudent] = useState(null);
  const [selectedPaymentRequestPayment, setSelectedPaymentRequestPayment] = useState(null);

  // Modal state for "Update request settings"
  const [isUpdateSettingsModalOpen, setIsUpdateSettingsModalOpen] = useState(false);
  const toggleUpdateSettingsModal = () => setIsUpdateSettingsModalOpen(v => !v);
  // Modal state for "Update request"
  const [isUpdateRequestModalOpen, setIsUpdateRequestModalOpen] = useState(false);
  const toggleUpdateRequestModal = () => setIsUpdateRequestModalOpen(v => !v);
  // Modal state for "Register Payment"
  const [isRegisterPaymentModalOpen, setIsRegisterPaymentModalOpen] = useState(false);
  const toggleRegisterPaymentModal = () => setIsRegisterPaymentModalOpen(v => !v);
  const { submitPayment, loading:creatingPayment } = useCreatePayment();
  // Modal state for "Register Payment"
  const [isUpdatePaymentModalOpen, setIsUpdatePaymentModalOpen] = useState(false);
  const toggleUpdatePaymentModal = () => setIsUpdatePaymentModalOpen(v => !v);
  const { updatePayment, loading:updatingPayment } = useCreatePayment();
  
  // Modal state for "Payment Details"
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [showPaymentUpdateModal, setShowPaymentUpdateModal] = useState(false);

  // Modal state for "Add Balance"
  const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);
  const toggleBalanceModal = () => setBalanceModalOpen(v => !v);

  const features = {
    canRegisterPayment,
    canAddBalance,
    canExport,
    canViewReport,
    canViewPayments,
    canViewRecharges
  };

  // Fetch paymentRequest details
  const { paymentRequest, loading:detailsLoading, error, reload:detailsReload } = usePaymentRequestDetails(payment_request_id);
  const { student, paymentRequest:request, payments, paymentInfo, breakdown } = paymentRequest || {};

  // Fetch catalogs
  const { data: paymentConcepts, fetchData: loadPaymentConcepts } = useCatalog('paymentConcepts');
  const { data: paymentThrough, fetchData: loadPaymentThrough } = useCatalog('paymentThrough');

  const openPaymentDetailModal = async (paymentId) => {
    try {
      const res = await getPaymentDetail(paymentId, i18n.language)
      setSelectedPayment(res.content?.[0] || null)
      setShowPaymentDetailModal(true)
    } catch {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }
  };

  

  const openPaymentUpdateModal = async (paymentId) => {
    try {
      const res = await getPaymentDetail(paymentId, i18n.language)
      setSelectedPayment(res.content?.[0] || null)
      setShowPaymentUpdateModal(true)
    } catch {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }
  };



  // Fetch paymentRequest logs
  const { logs, loading:logsLoading, error:logsError, reload:logsReload } = usePaymentRequestLogs(payment_request_id, i18n.language);

  useEffect(() => {
    setLoading(detailsLoading || logsLoading);
  }, [detailsLoading, logsLoading]);
  
  // register form groups (payments)
  const registerPaymentFormGroups = [
    {
      groupTitle: 'payment',
      columns: 1,
      fields: [
        { key: 'payment_month', label: 'payment_month', type: 'month' },
        { key: 'amount', label: 'amount', type: 'number', required: true},
        { key: 'comments', label: 'comments', type: 'text' },
				{ 
					key: 'payment_through_id', 
					label: 'payment_method', 
					type: 'select',
					required: true,
					options: paymentThrough.map(p => ({
						value: p.id,
						label: p.name
					}))
				},
      ],
    },
  ];

  // Update form groups (settings)
  const updateSettingsFormGroups = [
    {
      groupTitle: 'fee',
      columns: 1,
      fields: [
        {
          key: 'feeAmount',
          label: 'fee_amount',
          key1:"late_fee",
          key2:"fee_type",
          type: 'amountWithUnit',
          required: true,
          errorMessage: 'please_enter_amount'
        },
        { key: 'late_fee_frequency', label: 'late_fee_frequency', type: 'number' },
				{ 
					key: 'partial_payment', 
					label: 'partial_payment', 
					type: 'select',
					required: true,
          options: [
            { label: t("yes"), value: true },
            { label: t("no"), value: false }
          ],
				},
      ],
    },
    {
      columns: 1,
      fields: [
        { key: 'late_fee', label: 'late_fee_description', type: 'description' },
        { key: 'fee_type', label: 'fee_type_description', type: 'description' },
        { key: 'late_fee_frequency', label: 'late_fee_frequency_description', type: 'description' },
        { key: 'partial_payment', label: 'partial_payment_description', type: 'description' },
      ],
    },
  ];
  
  // Update form groups (main fields)
  const updatePaymentRequestFormGroups = [
    {
      groupTitle: 'fee',
      columns: 1,
      fields: [
        { key: 'pr_amount', label: 'amount', type: 'number' },
      ],
    },
    {
      columns: 1,
      fields: [
        { key: 'pr_pay_by', label: 'pay_by', type: 'datetime-local' },
        { key: 'pr_comments', label: 'comments', type: 'text' },
        { key: 'payment_month', label: 'payment_month', type: 'month' },
      ],
    },
  ];

  const paymentDetailFormGroups = [
		{
			groupTitle: 'student', // translation key for group title
			columns: 2,
			fields: [
				{ key: 'student_full_name', label: 'full_name', type: 'text' },
				{ key: 'payment_reference', label: 'payment_reference', type: 'text' },
			],
		},
		{
			groupTitle: 'student_details',
			columns: 4,
			fields: [
				{ key: 'generation', label: 'generation', type: 'text' },
				{ key: 'grade_group', label: 'grade_group', type: 'text' },
				{ key: 'scholar_level_name', label: 'scholar_level_name', type: 'text' },
				{ key: 'school_description', label: 'school_description', type: 'text' },
			],
		},
		{
			groupTitle: 'contact_and_address',
			columns: 3,
			fields: [
				{ key: 'address', label: 'address', type: 'text' },
				{ key: 'phone_number', label: 'phone_number', type: 'tel' },
				{ key: 'email', label: 'email', type: 'email' },
			],
		},
		{
			groupTitle: 'payment_details',
			columns: 4,
			fields: [
				{ key: 'payment_id', label: 'payment_id', type: 'number' },
				{ key: 'payment_month', label: 'payment_month', type: 'date' },
				{ key: 'amount', label: 'amount', type: 'number' },
				{ key: 'payment_status_name', label: 'payment_status_name', type: 'text' },
			],
		},
		{
			groupTitle: 'validation_details',
			columns: 3,
			fields: [
				{ key: 'validator_full_name', label: 'validator_full_name', type: 'text' },
				{ key: 'validator_phone_number', label: 'validator_phone_number', type: 'number' },
				{ key: 'validated_at', label: 'validated_at', type: 'datetime' },
			],
		}
	];

  // Update user form fields to pass to the modal component
	const updatePaymentFormGroups = [
		{
			groupTitle: 'user_info',
			columns: 4,
			fields: [
				{ key: 'payment_concept_id', label: 'payment_concept_id', type: 'text', required: true },
				{ key: 'payment_month', label: 'payment_month', type: 'text', required: true },
				{ key: 'amount', label: 'amount', type: 'number', required: true },
				{ key: 'payment_status_id', label: 'payment_status_id', type: 'text', required: true },
				{ key: 'validated_by_user_id', label: 'validated_by_user_id', type: 'text', required: true },
				{ key: 'validated_at', label: 'validated_at', type: 'text', required: true },
				{ key: 'created_at', label: 'created_at', type: 'text', required: true },
				{ key: 'comments', label: 'comments', type: 'text', required: true },
				{ key: 'payment_request_id', label: 'payment_request', type: 'text', required: true },
				{ key: 'payment_through_id', label: 'payment_through', type: 'text', required: true },
			]
		},
	];
  
  // Print handler
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: () => request?.payment_request_id
      ? `PaymentRequest-${request.payment_request_id}`
      : 'PaymentRequest',
  });

  // Style for each group
	const groupStyle = {
		borderBottom: '1px solid rgb(228 228 228)',
		marginBottom: '1.5rem'
	};

  const fmtDate = (dateStr, options) =>
    dateStr
      ? new Intl.DateTimeFormat(t('locale'), options).format(new Date(dateStr))
      : t('not_available');

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
  
      const payload = {
        amount: selectedPaymentRequest.pr_amount,
        pay_by: selectedPaymentRequest.pr_pay_by,
        comments: selectedPaymentRequest.pr_comments,
        payment_status_id: selectedPaymentRequest.pr_payment_status_id,
        late_fee: selectedPaymentRequest.late_fee,
        fee_type: selectedPaymentRequest.fee_type,
        late_fee_frequency: selectedPaymentRequest.late_fee_frequency,
        payment_month: selectedPaymentRequest.payment_month,
        partial_payment: selectedPaymentRequest.partial_payment === 'true' || selectedPaymentRequest.partial_payment === true,
        log_type_id: 1,
      };
  
      await updatePaymentRequest(payment_request_id, payload, i18n.language)
      .then((resData) => {
        swal(resData.title, resData.message, resData.type);

        if (resData.success !== false) {
          setIsUpdateSettingsModalOpen(false); 
          setIsUpdateRequestModalOpen(false); 
          detailsReload();
          logsReload();
        }
      })
      .catch(() => {
        swal('Error', 'Unexpected error occurred while updating.', 'error');
      })
      .finally(() => {
        setIsSaving(false);
      });

    } catch (error) {
      console.error('Error updating settings:', error);
      setIsSaving(false);
    }
  };

  const handleUpdatePayment = async () => { 

    try {
      setIsSaving(true);
  
      const payload = {
        payment_concept_id: selectedPayment.payment_concept_id,
        payment_month: selectedPayment.payment_month,
        amount: selectedPayment.amount,
        payment_status_id: selectedPayment.payment_status_id,
        validated_by_user_id: selectedPayment.validated_by_user_id,
        validated_at: selectedPayment.validated_at,
        created_at: selectedPayment.created_at,
        comments: selectedPayment.comments,
        payment_request_id: selectedPayment.payment_request_id,
        payment_through_id: selectedPayment.payment_through_id,
      };
  
      await updatePaymentRequest(payment_request_id, payload, i18n.language)
      .then((resData) => {
        swal(resData.title, resData.message, resData.type);

        if (resData.success !== false) {
          setIsUpdateSettingsModalOpen(false); 
          setIsUpdateRequestModalOpen(false); 
          detailsReload();
          logsReload();
        }
      })
      .catch(() => {
        swal('Error', 'Unexpected error occurred while updating.', 'error');
      })
      .finally(() => {
        setIsSaving(false);
      });

    } catch (error) {
      console.error('Error updating settings:', error);
      setIsSaving(false);
    }
  };

  const handleRegisterPayment = async () => { 
    setIsSaving(true);
  
    const payload = {
      student_id: selectedPaymentRequestStudent.student_id,
      payment_concept_id: selectedPaymentRequest.payment_concept_id,
      payment_month: selectedPaymentRequest.payment_month,
      amount: selectedPaymentRequest.amount,
      comments: selectedPaymentRequest.comments,
      payment_request_id: selectedPaymentRequest.payment_request_id,
      payment_through_id: selectedPaymentRequest.payment_through_id,
    };
  
    const success = await submitPayment(payload);
    console.log(success)
    if (success) {
      toggleRegisterPaymentModal();
      detailsReload();
    }
  
    setIsSaving(false); // always unset saving
  };
      
  // detailsLoading, logsLoading
  const SettingsCard = (
    detailsLoading ? 
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
          <MDBBtn 
            flat="true" 
            size="sm" 
            onClick={() => {
              setSelectedPaymentRequest(request);
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
                setSelectedPaymentRequest(request);
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
                <strong>{request.late_fee ?? "N/A"}</strong>
              </div>
            </MDBCol>

            {/* Fee Type */}
            <MDBCol md="12" className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <MDBIcon fas icon="tag" className="me-2 text-secondary" />
                  <span className="mb-0">{t("fee_type")}:</span>
                </div>
                <strong>{request.fee_type ?? "N/A"}</strong>
              </div>
            </MDBCol>

            {/* Late Fee Frequency */}
            <MDBCol md="12" className="mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <MDBIcon fas icon="sync-alt" className="me-2 text-secondary" />
                  <span className="mb-0">{t("late_fee_frequency")}:</span>
                </div>
                <strong>{request.late_fee_frequency ?? "N/A"}</strong>
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
                    request.partial_payment
                      ? "bg-success text-white"
                      : "bg-danger text-white"
                  }`}
                  style={{ display: "inline-block" }}
                >
                  {request.partial_payment_transformed ?? "N/A"}
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
                <strong>{request.mass_upload ?? "N/A"}</strong>
              </div>
            </MDBCol>


          </MDBRow>
        </div>
      </MDBCardBody>
    </MDBCard>
  );

  const DetailsCard = (
    detailsLoading ? 
    <MDBCard className="shadow-sm border-0 mb-3">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <MDBContainer className="my-5 text-center">
          <MDBSpinner grow color="primary" />
        </MDBContainer>
      </div>
    </MDBCard>
    :
    <div ref={printRef}>
      <MDBCard className="shadow-sm border-0 mb-3">
        <MDBCardHeader className="bg-white d-flex justify-content-between align-items-center border-bottom">
          <div className="d-flex align-items-center">
              <MDBIcon fas icon="receipt" className="me-2" />
            <h5 className="mb-0">{t('payment_request')} #{request.payment_request_id}</h5>
          </div>

          {/* ── Desktop: show button inline ── */}
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
                setSelectedPaymentRequestStudent(student);
                toggleRegisterPaymentModal();
                
                loadPaymentConcepts();
                loadPaymentThrough();
              }}
            >
              <MDBIcon fas icon="hand-holding-usd" className="cursor-pointer" />
            </MDBBtn>
          </MDBCol>

          {/* ── Mobile: show a dropdown instead ── */}
          <div className="d-block d-md-none">
            <MDBDropdown>
              <MDBDropdownToggle tag="button" className="btn btn-light btn-sm"></MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem className='p-1' onClick={() => {
                  setSelectedPaymentRequest(request);
                  setSelectedPaymentRequestStudent(student);
                  toggleUpdateRequestModal();
                
                  loadPaymentConcepts();
                  loadPaymentThrough();
                }}>
                  {t('edit')}
                </MDBDropdownItem>
                <MDBDropdownItem className='p-1' onClick={handlePrint}>
                  {t('print')}
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </div>
        </MDBCardHeader>
        <MDBCardBody>

          <div style={groupStyle}>
            {/* Student Information */}
            <MDBRow className="d-flex justify-content-between align-items-center">
              <MDBCol>
                <h6 className="text-uppercase text-muted small mb-3">{t('student_information')}</h6>
              </MDBCol>
                
              <MDBCol className="d-flex justify-content-end gap-2">
                <strong
                  className={`px-2 py-1 rounded ${
                    request.pr_payment_status_id === 5
                      ? "bg-success text-white"
                      : "bg-warning text-white"
                  }`}
                  style={{ display: "inline-block" }}
                >
                  <h5 className="text-white my-0">{request.ps_pr_name}</h5>
                </strong>
                
              </MDBCol>
            </MDBRow>
            <MDBRow className="gx-3 gy-2 mb-4">
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('full_name')}</small>
                <p className="fw-bold mb-0">{student.full_name || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('email')}</small>
                <p className="fw-bold mb-0">{student.email || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('payment_reference')}</small>
                <p className="fw-bold mb-0">{student.payment_reference || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('phone_number')}</small>
                <p className="fw-bold mb-0">{student.phone_number || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('generation')}</small>
                <p className="fw-bold mb-0">{student.generation || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('grade_group')}</small>
                <p className="fw-bold mb-0">{student.grade_group || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('scholar_level')}</small>
                <p className="fw-bold mb-0">{student.scholar_level_name || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('user_status')}</small>
                <p className="fw-bold mb-0">{student.user_status || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('group_status')}</small>
                <p className="fw-bold mb-0">{student.group_status || t('not_available')}</p>
              </MDBCol>
            </MDBRow>
          </div>


          <div style={groupStyle}>
            {/* Request Information */}
            <h6 className="text-uppercase text-muted small mb-3">{t('request_information')}</h6>
            <MDBRow className="gx-3 gy-2 mb-4">
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('created_on')}</small>
                <p className="fw-bold mb-0">{fmtDate(request.pr_created_at, { year: 'numeric', month: 'long', day: '2-digit' })}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('due_date')}</small>
                <p className="fw-bold mb-0">{fmtDate(request.pr_pay_by, { year: 'numeric', month: 'long', day: '2-digit' })}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('payment_month')}</small>
                <p className="fw-bold mb-0">{fmtDate(request.payment_month, { year: 'numeric', month: 'long'})}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('periods_late')}</small>
                <p className="fw-bold mb-0">{paymentInfo.latePeriods}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('late_fee_per_period')}</small>
                <p className="fw-bold mb-0">{request.fee_type+request.late_fee.toFixed(2)}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('late_fee_total')}</small>
                <p className="fw-bold mb-0">{paymentInfo.accumulatedFees ? "$"+(paymentInfo.accumulatedFees.toFixed(2)) : t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('initial_amount')}</small>
                <p className="fw-bold mb-0">${request.pr_amount.toFixed(2)}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('paid_to_date')}</small>
                <p className="fw-bold mb-0">{paymentInfo.totalPaid ? '$'+paymentInfo.totalPaid.toFixed(2) : t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('amount_due_now')}</small>
                <p className="fw-bold mb-0 text-danger">{paymentInfo.pendingPayment? "$"+(paymentInfo.pendingPayment).toFixed(2) : t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('request_status')}</small>
                <p className="fw-bold mb-0">{request.ps_pr_name || t('not_available')}</p>
              </MDBCol>
              <MDBCol md="4" sm="6">
                <small className="text-muted">{t('payment_concept')}</small>
                <p className="fw-bold mb-0">{request.pt_name || t('not_available')}</p>
              </MDBCol>
            </MDBRow>
          </div>

          {/* Comments */}
          {request.pr_comments != null && (
            <div style={groupStyle}>
              <div className="mb-4">
                <h6 className="text-uppercase text-muted small">{t('comments')}</h6>
                <p className="fst-italic">{request.pr_comments || t('not_available')}</p>
              </div>
            </div>
          )}

          {/* Payments List */}
          <>
            <h6 className="text-uppercase text-muted small mb-3">{t('payments_breakdown')}</h6>
            <div className="d-none d-md-flex mb-4">
              <MDBTable small style={{width:"100%"}}>
                <MDBTableHead light>
                  <tr>
                    <th>{t('payment_id')}</th>
                    <th>{t('concept')}</th>
                    <th>{t('status')}</th>
                    <th>{t('date')}</th>
                    <th className="text-end">{t('amount')}</th>
                    <th className="text-end">{t('balance')}</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>

                  {/* Payment rows */}
                  {breakdown.map(p => (
                    <tr key={p.date+"-"+p.balance}>
                      <td>{p.payment_id? (<LinkCell id={p.payment_id} text={p.payment_id} onClick={() => {
                          openPaymentUpdateModal();

                        }}/>): '-'}</td>
                      <td>{t(p.type)}</td>
                      <td>{p.status_name || '-'}</td>
                      <td>{fmtDate(p.date, {
                        year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}</td>
                      <td className="text-end" style={Number(p.amount)<=0?{color:"red"}:{color:"green"}}>{Number(p.amount) < 0 ? `-$${Math.abs(Number(p.amount)).toFixed(2)}` : `$${Number(p.amount).toFixed(2)}`}</td>
                      <td className="text-end" style={Number(p.balance)<0?{color:"red"}:{color:"green"}}>{Number(p.balance) < 0 ? `-$${Math.abs(Number(p.balance)).toFixed(2)}` : `$${Number(p.balance).toFixed(2)}`}</td>
                    </tr>
                  ))}

                  {/* Totals row */}
                  <tr className="table-light fw-bold">
                    <td colSpan="4" className="text-end">{t('total')}</td>
                    {<td className="text-end" style= {(paymentInfo.pendingPayment)>0?{color:"red"}:{color:"green"}}>-${(paymentInfo.pendingPayment).toFixed(2)}</td>}
                    <td></td>
                  </tr>
                </MDBTableBody>
              </MDBTable>
            </div>
          </>

          {/* stacked cards for mobile only */}
          <div className="d-block d-md-none mt-4">
            {breakdown.map(p => (
              <div className="payment-card p-3 mb-2 border rounded" key={p.date}>
                <div><strong>{t("concept")}:</strong> {t(p.concept)}</div>
                <div><strong>{t("date")}:</strong> {fmtDate(p.date)}</div>
                <div style={Number(p.amount)<=0?{color:"red"}:{color:"green"}}><strong>{t("amount")}:</strong> {Number(p.amount) < 0 ? `-$${Math.abs(Number(p.amount)).toFixed(2)}` : `$${Number(p.amount).toFixed(2)}`}</div>
                <div><strong>{t("status")}:</strong> {p.status_name || '-'}</div>
              </div>
            ))}
          </div>


        </MDBCardBody>
      </MDBCard>
    </div>
  );


  const LogsCard = (
    detailsLoading ? 
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
                {fmtDate(log.updated_at, {
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
                  if (isDate && field === 'payment_month') return fmtDate(val, { year: 'numeric', month: 'long' });
                  if (isDate)
                    return fmtDate(val, {
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

  // if (loading) return <Layout><p>{t('loading')}</p></Layout>;
  if (loading) {
    return (
      <Layout pageTitle={t('payment_request_details')}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <MDBContainer className="my-5 text-center">
          <MDBSpinner grow color="primary" />
        </MDBContainer>
      </div>
      </Layout>
    );
  }
  if (error)   return <Layout><p className="text-danger">{error}</p></Layout>;
  if (!paymentRequest) return <Layout><p>{t('no_payment_request_found')}</p></Layout>;

  return (
    <Layout pageTitle={t('payment_request_details')}>

      {/*
        ─────────────── DESKTOP LAYOUT ───────────────
        On md+ screens: two-column, both columns stretch to match height.
        Left: DetailsCard; Right: SettingsCard + scrollable LogsCard
      */}
      <div
        className="d-none d-md-flex"
        style={{
          gap: '1rem',
          alignItems: 'stretch'   /* make both columns equal height */
        }}
      >
        {/* DETAILS COLUMN */}
        <div 
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {DetailsCard}
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
      </div>

      {/*
        ─────────────── MOBILE LAYOUT ───────────────
        On < md: single column, in this exact order:
        1) SettingsCard
        2) DetailsCard
        3) LogsCard (scrollable)
      */}

      <div 
        className="d-block d-md-none"
      >
        {/* 1) Settings */}
        {SettingsCard}

        {/* 2) Details */}
        {DetailsCard}

        {/* 3) Logs, take up e.g. half the viewport and scroll */}
        {LogsCard && (
          <>
            {LogsCard}
          </>
        )}
      </div>

      {/* Monthly Payments Report */}

      
      {/* ------- Payments Report ------- */}

      {/* {features.canViewPayments && (
        <PaymentsList
          studentId={studentId}
          canAdd={features.canRegisterPayment}
          canExport={features.canExport}
          onRowClick={openPaymentDetail}
        />
      )} */}

      {/* Register Payment Modal */}
      {/* <FormModal
        open={isRegisterModalOpen}
        onClose={toggleRegisterModal}
        title={t('register_payment')}
        // formGroups and onSave to be implemented
      /> */}

      {/* Add Balance Modal */}
      {/* <FormModal
        open={isBalanceModalOpen}
        onClose={toggleBalanceModal}
        title={t('add_balance')}
        // formGroups and onSave to be implemented
      /> */}

      {/* Add School Modal (XL size) */}
			{/* <FormModal
				open={isAddModalOpen}
				onClose={toggleAddModal}
				formGroups={addPaymentFormGroups}
				data={newPayment}
				setData={setNewPayment}
				onSave={handleAddUser}
				title={t('add_payment')}
				size="xl"
				idPrefix="create_"
				isSaving={isSaving}
			/> */}

      {/* Update School Modal */}
      <FormModal
        open={isUpdateSettingsModalOpen}
        onClose={toggleUpdateSettingsModal}
        formGroups={updateSettingsFormGroups}
        data={selectedPaymentRequest}
        setData={setSelectedPaymentRequest}
        onSave={handleUpdate}
        title={t('update_settings')}
        size="m"
        idPrefix="updateSetings_"
        isSaving={isSaving}
      />

      <FormModal
        open={isUpdateRequestModalOpen}
        onClose={toggleUpdateRequestModal}
        formGroups={updatePaymentRequestFormGroups}
        data={selectedPaymentRequest}
        setData={setSelectedPaymentRequest}
        onSave={handleUpdate}
        title={t('update_payment_request')}
        size="m"
        idPrefix="updateRequest_"
        isSaving={isSaving}
      />

      <FormModal
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
      />
      
      <FormModal
        // show={showPaymentDetailModal}
        // setShow={setShowPaymentDetailModal}
        // formGroups={paymentDetailFormGroups}
        // data={selectedPayment}
        // title={t('payment')}
        // size="xl"
        // xxxxxxx
        open={showPaymentUpdateModal}
        onClose={toggleUpdatePaymentModal}
        formGroups={paymentDetailFormGroups}
        data={selectedPayment}
        setData={setSelectedPayment}
        onSave={handleUpdatePayment}
        title={t('update_payment')}
        size="xl"
        idPrefix="updatePayment_"
        isSaving={isSaving}
      />
    </Layout>
  );
}
