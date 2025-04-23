import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import {
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBSpinner,
  MDBCol,
  MDBIcon,
  MDBTooltip,
  MDBBtn
} from 'mdb-react-ui-kit';
import FormModal from '../common/FormModal';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import MassTeachersUploadModal from '../common/MassTeachersUploadModal';

const SchoolsPage = () => {
  const { t, i18n } = useTranslation();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreate_Payment_RequestModalOpen, setIsCreate_Payment_RequestModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMassTeachersUploadModalOpen, setIsMassTeachersUploadModalOpen] = useState(false);
  
  // New state to track the selected school for mass students upload
  const [selectedSchool, setSelectedSchool] = useState(null);

  const toggleUpdateModal = () => setIsUpdateModalOpen(prev => !prev);
  const toggleCreate_Payment_RequestModal = () => setIsCreate_Payment_RequestModalOpen(prev => !prev);
  
  // Fetch schools data and then update each school with its student count
  const fetchSchools = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8080/api/schools/list?lang=${i18n.language}&status_filter=-1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const schoolsData = response.data;
        // For each school, fetch the list of students and count them
        Promise.all(schoolsData.map(school =>
          axios.get(`http://localhost:8080/api/students/list?school_id=${school.school_id}&lang=${i18n.language}&status_filter=-1`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(resp => ({
            ...school,
            studentCount: resp.data.length
          }))
          .catch(err => {
            console.error('Error fetching student count for school', school.school_id, err);
            return { ...school, studentCount: 0 };
          })
        ))
        .then(updatedSchools => {
          setSchools(updatedSchools);
          setLoading(false);
        });
      })
      .catch(err => {
        console.error('Error fetching schools:', err);
        setError(t('failed_to_fetch_schools'));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSchools();
  }, [i18n.language, t]);

  // Update school form groups remain unchanged
  const updateSchoolFormGroups = [
    {
      groupTitle: 'description',
      columns: 2,
      fields: [
        { key: 'description_es', label: 'description_es', type: 'text' },
        { key: 'description_en', label: 'description_en', type: 'text' },
      ],
    },
    {
      groupTitle: 'school_details',
      columns: 2,
      fields: [
        { key: 'commercial_name', label: 'commercial_name', type: 'text' },
        { key: 'business_name', label: 'business_name', type: 'text' },
        { key: 'tax_id', label: 'tax_id', type: 'text' },
        { key: 'default_tuition', label: 'default_tuition', type: 'number' },
      ],
    },
    {
      groupTitle: 'contact_and_address',
      columns: 2,
      fields: [
        { key: 'address', label: 'address', type: 'text' },
        { key: 'street', label: 'street', type: 'text' },
        { key: 'ext_number', label: 'ext_number', type: 'text' },
        { key: 'int_number', label: 'int_number', type: 'text' },
        { key: 'suburb', label: 'suburb', type: 'text' },
        { key: 'locality', label: 'locality', type: 'text' },
        { key: 'municipality', label: 'municipality', type: 'text' },
        { key: 'state', label: 'state', type: 'text' },
        { key: 'phone_number', label: 'phone_number', type: 'tel' },
        { key: 'email', label: 'email', type: 'email' },
      ],
    }
  ];

  // Update school form groups remain unchanged
  const createPaymentRequestFormGroups = [
    {
      groupTitle: 'fee',
      columns: 2,
      fields: [
        {
          key: 'feeAmount',
          label: 'fee_amount',
          type: 'amountWithUnit',
          required: true,
          errorMessage: 'please_enter_amount'
        },
        { key: 'late_fee_frequency', label: 'late_fee_frequency', type: 'number' },
      ],
    },
    {
      groupTitle: 'payment',
      columns: 2,
      fields: [
        { key: 'pay_by', label: 'pay_by', type: 'date' },
        { key: 'payment_type', label: 'payment_type', type: 'text' },
      ],
    },
    {
      groupTitle: 'comments',
      columns: 1,
      fields: [
        { key: 'comments', label: 'comments', type: 'text' },
      ],
    },
  ];

  const handleUpdateSchool = () => {
    const token = localStorage.getItem('token');
    setIsSaving(true);
    axios.put(`http://localhost:8080/api/schools/update/${selectedSchool.school_id}?lang=${i18n.language}`, 
      {
        related_school_id: selectedSchool.related_school_id,
        description_en: selectedSchool.description_en,
        description_es: selectedSchool.description_es,
        commercial_name: selectedSchool.commercial_name,
        business_name: selectedSchool.business_name,
        tax_id: selectedSchool.tax_id,
        street: selectedSchool.street,
        ext_number: selectedSchool.ext_number,
        int_number: selectedSchool.int_number,
        suburb: selectedSchool.suburb,
        locality: selectedSchool.locality,
        municipality: selectedSchool.municipality,
        state: selectedSchool.state,
        phone_number: selectedSchool.phone_number,
        email: selectedSchool.email,
        default_tuition: selectedSchool.default_tuition,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(response => {
      const resData = response.data;
      if (resData.success === false) {
        swal(resData.title, resData.message, resData.type);
      } else {
        swal(resData.title, resData.message, resData.type);
        setIsUpdateModalOpen(false);
        fetchSchools();
      }
      setIsSaving(false);
    })
    .catch(error => {
      swal(t('error_title'), t('update_failed'), 'error');
      console.error('Error updating school:', error);
      setIsSaving(false);
    });
  };

  if (error) {
    return (
      <MDBContainer className="my-5">
        <p className="text-danger">{error}</p>
      </MDBContainer>
    );
  }
  
  return (
    <Layout pageTitle={t('schools')}>
      <MDBContainer className="py-4">
        <MDBRow>
          {schools.map(school => (
            <MDBCol md="12" key={school.school_id} className="mb-4">
              <MDBCard>
                <MDBCardHeader
                  style={{
                    backgroundColor: school.enabled ? "" : "brown",
                    color: school.enabled ? "" : "white"
                  }}
                >
                  <MDBRow className="d-flex justify-content-between align-items-center">
                    <MDBCol className="col-auto">
                      <h5 className="mb-0">{school.description}</h5>
                      {school.enabled ? "" : (<small>{t("school_disabled")}</small>)}
                    </MDBCol>
                    <MDBCol className="col-auto">
                      {/* Generate paymente request button */}
                      <MDBBtn 
                        flat="true" 
                        size="sm" 
                        color="light" 
                        rippleColor="dark" 
                        onClick={() => setIsCreate_Payment_RequestModalOpen(true)}
                      >
                        <MDBIcon fas icon="hand-holding-usd" className="me-1" />
                        {t('generate_payment_request')}
                      </MDBBtn>
                      {/* Import Teachers button */}
                      <MDBBtn 
                        flat="true" 
                        size="sm" 
                        color="light" 
                        rippleColor="dark" 
                        onClick={() => setIsMassTeachersUploadModalOpen(true)}
                      >
                        <MDBIcon fas icon="upload" className="me-1" />
                        {t('import_teachers')}
                      </MDBBtn>
                      <MDBBtn 
                        flat="true" 
                        size="sm" 
                        onClick={() => {
                          setSelectedSchool(school);
                          toggleUpdateModal();
                        }}
                      >
                        <MDBIcon fas icon="pen" className="cursor-pointer"/>
                      </MDBBtn>
                    </MDBCol>
                  </MDBRow>
                </MDBCardHeader>
                <MDBCardBody>
                  <MDBRow>
                    <p className="fw-bold">{school.business_name ? school.business_name:"N/A"}</p>
                      <MDBCol md="6">
                        <MDBTooltip tag="span" title={t("address")} placement="left">
                          <p>
                            <MDBIcon md="6" icon="map-marker-alt" className="me-1" />
                            {school.address ? school.address:"N/A"}
                          </p>
                        </MDBTooltip>
                      </MDBCol>
                      <MDBCol md="6">
                        <MDBTooltip tag="span" title={t("phone_number")} placement="left">
                          <p>
                            <MDBIcon md="6" icon="phone" className="me-1" />
                            {school.phone_number ? school.phone_number:"N/A"}
                          </p>
                        </MDBTooltip>
                      </MDBCol>
                      <MDBCol md="6">
                        <MDBTooltip tag="span" title={t("email")} placement="left">
                          <p>
                            <MDBIcon md="6" icon="envelope" className="me-1" />
                            {school.email ? school.email:"N/A"}
                          </p>
                        </MDBTooltip>
                      </MDBCol>
                      <MDBCol md="6">
                        <MDBTooltip tag="span" title={t("tax_id")} placement="left">
                          <p>
                            <MDBIcon md="6" icon="id-card" className="me-1" />
                            {school.tax_id ? school.tax_id:"N/A"}
                          </p>
                        </MDBTooltip>
                      </MDBCol>
                      <MDBCol md="6">
                        <MDBTooltip tag="span" title={t("school_status")} placement="left">
                          <p>
                            <MDBIcon md="6" icon="info-circle" className="me-1" />
                            {school.school_status ? school.school_status:"N/A"}
                          </p>
                        </MDBTooltip>
                      </MDBCol>
                      <MDBCol md="6">
                        <MDBTooltip tag="span" title={t("student_count")} placement="left">
                          <p>
                            <MDBIcon md="6" icon="users" className="me-1" />
                            {school.studentCount ? school.studentCount:"0"} {t('students')}
                          </p>
                        </MDBTooltip>
                      </MDBCol>
                      <MDBCol md="6">
                        <MDBTooltip tag="span" title={t("default_tuition")} placement="left">
                          <p>
                            <MDBIcon md="6" icon="dollar-sign" className="me-1" />
                            {school.default_tuition ? school.default_tuition:"N/A"}
                          </p>
                        </MDBTooltip>
                      </MDBCol>
                  </MDBRow>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}
        </MDBRow>
      </MDBContainer>

      {/* Render mass teachers upload modal similarly */}
      {isMassTeachersUploadModalOpen && (
        <MassTeachersUploadModal 
          open={isMassTeachersUploadModalOpen} 
          onClose={() => setIsMassTeachersUploadModalOpen(false)} 
          school_id={selectedSchool ? selectedSchool.school_id : null}
          // onUploadSuccess={() => fetchUsers()}
        />
      )}

      {/* Update School Modal */}
      <FormModal
        open={isUpdateModalOpen}
        onClose={toggleUpdateModal}
        formGroups={updateSchoolFormGroups}
        data={selectedSchool}
        setData={setSelectedSchool}
        onSave={handleUpdateSchool}
        title={t('update_school')}
        size="xl"
        idPrefix="update_"
        isSaving={isSaving}
      />

      {/* Create_Payment_Request School Modal */}
      <FormModal
        open={isCreate_Payment_RequestModalOpen}
        onClose={toggleCreate_Payment_RequestModal}
        formGroups={createPaymentRequestFormGroups}
        data={selectedSchool}
        setData={setSelectedSchool}
        onSave={handleUpdateSchool}
        title={t('create_mass_payment_request')}
        size="xl"
        idPrefix="create_payment_request_"
        isSaving={isSaving}
      />
    </Layout>
  );
};

export default SchoolsPage;
