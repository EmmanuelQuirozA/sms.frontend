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
  MDBBtn
} from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import FiltersSidebar from '../common/FiltersSidebar';
import swal from 'sweetalert';
import FormModal from '../common/FormModal';
import NoDataComponent from '../../components/NoDataComponent';

const SchoolsPage = () => {
  const { t, i18n } = useTranslation();
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For Add School modal
  const [isFilterVisible, setIsFilterVisible] = useState(false); // For Filter modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // For Update School modal
	const [isSaving, setIsSaving] = useState(false);

	// Toggle functions
	const toggleAddModal = () => setIsAddModalOpen((prev) => !prev);
	const toggleUpdateModal = () => setIsUpdateModalOpen((prev) => !prev);
	const toggleFilterVisibility = () => setIsFilterVisible((prev) => !prev);

	
  // Temporary filters state (keys must match school object properties)
  const [tempFilters, setTempFilters] = useState({
    school_id: '',
    description_es: '',
    description_en: '',
    commercial_name: '',
    business_name: '',
    address: '',
    school_status: '',
  });
	// Form state for updating a school (pre-populated when clicking actions)
  const [selectedSchool, setSelectedSchool] = useState(null);

	// Form state for adding a new school
	const [newSchool, setNewSchool] = useState({
		related_school_id: '',
		description_en: '',
		description_es: '',
		commercial_name: '',
		business_name: '',
		tax_id: '',
		street: '',
		ext_number: '',
		int_number: '',
		suburb: '',
		locality: '',
		municipality: '',
		state: '',
		phone_number: '',
		email: ''
	});

	// Add school form fields to pass to the modal component
	const addSchoolFormGroups = [
		{
			groupTitle: 'general_info', // translation key for group title
			columns: 1,
			fields: [
				{ key: 'related_school_id', label: 'related_school_id', type: 'text' },
			],
		},
		{
			groupTitle: 'description',
			columns: 2,
			fields: [
				{ key: 'description_en', label: 'description_en', type: 'text' },
				{ key: 'description_es', label: 'description_es', type: 'text' },
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

	// Update school form fields to pass to the modal component
	const updateSchoolFormGroups = [
		{
			groupTitle: 'general_info', // translation key for group title
			columns: 1,
			fields: [
				{ 
					key: 'related_school_id', 
					label: 'related_school_id', 
					type: 'select',
					options: schools.map(school => ({
						value: school.school_id,
						label: school.description
					}))
				},
			],
		},
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

  // Handler for adding a new school (stub: implement API call as needed)
  const handleAddSchool = () => {
    console.log('New school data:', newSchool);
    // Implement axios.post(...) to add the new school.
  	setIsSaving(true); // disable buttons and show spinner
    axios.post(`http://localhost:8080/api/schools/create?lang=${i18n.language}`, newSchool, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then((response) => {
      swal(t('success_title'), t('school_added_success'), 'success');
      toggleAddModal();
      fetchSchools(); // Refresh the table data
			setIsSaving(false);
    })
    .catch((error) => {
      swal(t('error_title'), t('add_failed'), 'error');
      console.error('Error adding school:', error);
			setIsSaving(false);
    });
  };

  // Handler for updating a school: sends a PUT request with the pre-populated data
  const handleUpdateSchool = () => {
    const token = localStorage.getItem('token');
    // Use school_id from selectedSchool as identifier.
  	setIsSaving(true); // disable buttons and show spinner
    axios
      .put(`http://localhost:8080/api/schools/update/${selectedSchool.school_id}?lang=${i18n.language}`, 
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      const resData = response.data;
      if (resData.success === false) {
        // For warnings or error messages returned from the SP, display SweetAlert with the provided type/title/message.
        swal(resData.title, resData.message, resData.type);
      } else {
        // If success is true, show a success alert and close the modal.
        swal(resData.title, resData.message, resData.type);
        setIsUpdateModalOpen(false);
        fetchSchools(); // Refresh the table data after update
      }
			setIsSaving(false);
    })
    .catch((error) => {
      // Handle any network or unexpected errors.
      swal(t('error_title'), t('update_failed'), 'error');
      console.error('Error updating school:', error);
			setIsSaving(false);
    });
	};


	const handleStatusSwitchChange = () => {
		swal({
			title: t('change_status_confirm_title'),
			text: t('change_status_confirm_text'),
			icon: 'warning',
			buttons: [t('cancel'), t('confirm')],
			dangerMode: true,
		}).then((willChange) => {
			if (willChange) {
				setIsSaving(true); // disable buttons and show spinner
				const token = localStorage.getItem('token');
  			
				axios
					.post(
						`http://localhost:8080/api/schools/update/${selectedSchool.school_id}/status?lang=${i18n.language}`,
						{},
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					.then((response) => {
						const resData = response.data;
						if (resData.success === false) {
							swal(resData.title, resData.message, resData.type);
						} else {
							swal(resData.title, resData.message, resData.type);
							// Optionally update the local status in selectedSchool or re-fetch data:
							fetchSchools();
							setIsUpdateModalOpen(false);
						}
						setIsSaving(false);
					})
					.catch((error) => {
						swal(t('error_title'), t('update_failed'), 'error');
						console.error('Error updating school status:', error);
						setIsSaving(false);
					});
			} else {
				// If user cancels, you might want to revert the switch state.
				// For example, re-fetch selectedSchool or simply do nothing.
				fetchSchools();
			}
		});
	};


  // Helper: Count active filters
  const getActiveFilterCount = () => {
    return Object.values(tempFilters).filter(
      (value) => value && value.trim() !== ''
    ).length;
  };
  // Apply filters: simple filtering based on tempFilters values
  const handleApplyFilters = () => {
    let filtered = schools;
    Object.keys(tempFilters).forEach((key) => {
      if (tempFilters[key]) {
        filtered = filtered.filter((school) =>
          school[key]?.toString().toLowerCase().includes(tempFilters[key].toLowerCase())
        );
      }
    });
    setFilteredSchools(filtered);
    setIsFilterVisible(false); // Close the sidebar after applying filters
  };
	const handleClearFilters = () => {
    setTempFilters({
      school_id: '',
      description: '',
      commercial_name: '',
      business_name: '',
      address: '',
      school_status: '',
    });
    setFilteredSchools(schools); // Reset to the original list
  };


	/* ------------------------------ Fetch data ------------------------------ */
	// Common function to fetch schools data
  const fetchSchools = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios
      .get(`http://localhost:8080/api/schools/list?lang=${i18n.language}&status_filter=-1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setSchools(response.data);
        setFilteredSchools(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching schools:', err);
        setError(t('failed_to_fetch_schools'));
        setLoading(false);
      });
  };
  // Fetch schools data whenever the language changes
  useEffect(() => {
    // Set loading to true whenever language changes
    setLoading(true);
    const token = localStorage.getItem('token');
    axios
      .get(`http://localhost:8080/api/schools/list?lang=${i18n.language}&status_filter=-1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setSchools(response.data);
        setFilteredSchools(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching schools:', err);
        setError(t('failed_to_fetch_schools'));
        setLoading(false);
      });
  }, [i18n.language, t]);

  // Define columns for the datatable, including an Actions column with update trigger
  const columns = [
    {
      name: t('school_id'),
      selector: (row) => row.school_id,
      sortable: true,
    },
    {
      name: t('description'),
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: t('commercial_name'),
      selector: (row) => row.commercial_name,
      sortable: true,
    },
    {
      name: t('business_name'),
      selector: (row) => row.business_name,
      sortable: true,
    },
    {
      name: t('address'),
      selector: (row) => row.address,
      sortable: true,
    },
    {
      name: t('enabled'),
      selector: (row) => row.school_status,
      sortable: true,
    },
    {
      name: t('actions'),
      cell: (row) => (
        <MDBBtn flat="true" size="sm" onClick={() => {
          setSelectedSchool(row);
          toggleUpdateModal();
        }}>
					<MDBIcon
          fas
          icon="ellipsis-v"
          className="cursor-pointer"
        /></MDBBtn>
      ),
      ignoreRowClick: true,
    },
  ];

  // Pagination options with translations
  const paginationOptions = {
    rowsPerPageText: t('rows_per_page'),
    rangeSeparatorText: t('of'),
    selectAllRowsItem: true,
    selectAllRowsItemText: t('all'),
  };

  // Prepare CSV data
  const csvData = filteredSchools.map((school) => ({
    [t('school_id')]: school.school_id,
    [t('description')]: school.description,
    [t('commercial_name')]: school.commercial_name,
    [t('business_name')]: school.business_name,
    [t('address')]: school.address,
    [t('enabled')]: school.school_status,
  }));

	const conditionalRowStyles = [
		{
			when: row => row.enabled === false, // adjust condition based on your data type
			style: {
				backgroundColor: 'rgba(255, 0, 0, 0.1)', // a light red background
			},
		},
	];

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
        {/* Header Row with Export, Add, Filter buttons */}
        <MDBRow>
          <MDBCol>
            <MDBCard>
							<MDBCardHeader>
								<MDBRow className="d-flex justify-content-between align-items-center">
									<MDBCol className="col-auto">
										<MDBIcon fas icon="building" className="me-1" />
										{t('schools_list')}
									</MDBCol>
									
									<MDBCol className="col-auto d-flex">
										{/* Export button */}
										<MDBBtn color='light' rippleColor='dark'>
											<CSVLink 
												data={csvData} 
												filename="schools.csv"
												style={{ textDecoration: 'none', color: 'inherit' }}
											>
												<MDBIcon fas icon="download" className="me-1" />
												{t('export')}
              				</CSVLink>
										</MDBBtn>
										{/* Add button */}
										<MDBBtn color='light' rippleColor='dark' onClick={toggleAddModal}>
											<MDBIcon fas icon="add" className="me-1" />
											{t('add')}
										</MDBBtn>
										{/* Filter button */}
										<MDBBtn color='light' rippleColor='dark'  onClick={toggleFilterVisibility}>
											<MDBIcon fas icon="filter" className="me-1" />
              {t('filter')} {getActiveFilterCount() > 0 ? `(${getActiveFilterCount()})` : ''}
										</MDBBtn>
									</MDBCol>
								</MDBRow>
							</MDBCardHeader>
							<MDBCardBody>
								<DataTable
									// title={t('schools_list')}
									columns={columns}
									data={filteredSchools}
									progressPending={loading}
									pagination
									highlightOnHover
									responsive
									// selectableRows
									persistTableHead
									striped
									paginationComponentOptions={paginationOptions}
									noDataComponent={<NoDataComponent message={t('no_data_available')} body={t('no_data_available_body')} />}
									conditionalRowStyles={conditionalRowStyles}
								/>
							</MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      {/* Add School Modal (XL size) */}
      <FormModal
        open={isAddModalOpen}
        onClose={toggleAddModal}
        formGroups={addSchoolFormGroups}
        data={newSchool}
        setData={setNewSchool}
        onSave={handleAddSchool}
        title={t('add_school')}
        size="xl"
        idPrefix="create_"
				isSaving={isSaving}
      />
			
			{/* Update School Modal (XL size) */}
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
				changeStatus={true}
				handleStatusSwitchChange={handleStatusSwitchChange}
      />

			{/* Filter Sidebar */}
			<FiltersSidebar
        filters={Object.keys(tempFilters).map((key) => ({
          id: key,
          label: t(key),
          value: tempFilters[key],
          onChange: (value) =>
						 setTempFilters((prev) => ({ ...prev, [key]: value })),
        }))}
				applyFilters={handleApplyFilters}
				clearFilters={handleClearFilters}
				isVisible={isFilterVisible}
				toggleVisibility={toggleFilterVisibility}
      />
    </Layout>
  );
};

export default SchoolsPage;
