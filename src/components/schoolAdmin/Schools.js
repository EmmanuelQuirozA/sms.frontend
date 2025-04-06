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
  const [isSaving, setIsSaving] = useState(false);
  const [isMassTeachersUploadModalOpen, setIsMassTeachersUploadModalOpen] = useState(false);
  
  // New state to track the selected school for mass students upload
  const [selectedSchool, setSelectedSchool] = useState(null);

  const toggleUpdateModal = () => setIsUpdateModalOpen(prev => !prev);

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

  if (loading) {
    return (
      <MDBContainer className="text-center py-5">
        <MDBSpinner size="lg" />
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
                        <MDBIcon fas icon="ellipsis-v" className="cursor-pointer"/>
                      </MDBBtn>
                    </MDBCol>
                  </MDBRow>
                </MDBCardHeader>
                <MDBCardBody>
                  <MDBRow>
                    <p className="fw-bold">{school.business_name}</p>
                    <MDBCol md="6" className="mb-0">
                      <MDBTooltip tag="span" title={t("address")} placement="left">
                        <p>
                          <MDBIcon icon="map-marker-alt" className="me-1" />
                          {school.address}
                        </p>
                      </MDBTooltip>
                      <MDBTooltip tag="span" title={t("phone_number")} placement="left">
                        <p>
                          <MDBIcon icon="phone" className="me-1" />
                          {school.phone_number}
                        </p>
                      </MDBTooltip>
                      <MDBTooltip tag="span" title={t("email")} placement="left">
                        <p>
                          <MDBIcon icon="envelope" className="me-1" />
                          {school.email}
                        </p>
                      </MDBTooltip>
                    </MDBCol>
                    <MDBCol md="6" className="mb-0">
                      <MDBTooltip tag="span" title={t("tax_id")} placement="left">
                        <p>
                          <MDBIcon icon="id-card" className="me-1" />
                          {school.tax_id}
                        </p>
                      </MDBTooltip>
                      <MDBTooltip tag="span" title={t("school_status")} placement="left">
                        <p>
                          <MDBIcon icon="info-circle" className="me-1" />
                          {school.school_status}
                        </p>
                      </MDBTooltip>
                      <MDBTooltip tag="span" title={t("student_count")} placement="left">
                        <p>
                          <MDBIcon icon="users" className="me-1" />
                          {school.studentCount} {t('students')}
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
    </Layout>
  );
};

export default SchoolsPage;
