// src/pages/ConfigPage.js
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
import { useTranslation } from 'react-i18next';
import FiltersSidebar from '../common/FiltersSidebar';
import NoDataComponent from '../../components/NoDataComponent';

const ConfigPage = () => {
  const { t, i18n } = useTranslation();
  const [usersLogs, setUsersLogs] = useState([]);
  const [filteredUsers, setFilteredUsersLogs] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  
  // Modal states
  const [isFilterVisible, setIsFilterVisible] = useState(false); // For Filter modal

  
	// Toggle functions
	const toggleFilterVisibility = () => setIsFilterVisible((prev) => !prev);

  // Temporary filters state (keys must match user object properties)
  const [tempFilters, setTempFilters] = useState({
    school_id: '',
    full_name: '',
    username: '',
    role: '',
  });
  
  // Dummy user data based on your sample
  const user = {
    user_id: 5,
    person_id: 5,
    school_id: 1,
    role_id: 3,
    email: "test@test.com",
    username: "ATZIMBAD",
    role_name: "School Admin",
    full_name: "ATZIMBA DIAZ DIAZ",
    address: "   , , , ",
    commercial_name: "Instituto Alexander Luria",
    business_name: "Instituto Alexander Luria SA de CV",
    first_name: "ATZIMBA",
    last_name_father: "DIAZ",
    last_name_mother: "DIAZ",
    birth_date: "2004-03-17",
    phone_number: "",
    tax_id: "",
    curp: "null",
    street: "",
    ext_number: "",
    int_number: "",
    suburb: "",
    locality: "",
    municipality: "",
    state: "",
    personal_email: "",
    image: "",
    user_enabled: true,
    role_enabled: true,
    school_enabled: true,
    birth_date_formated: "03-17-2004",
    user_status: "Enabled",
    role_status: "Enabled",
    school_status: "Enabled"
  };

  // Style for each group
  const groupStyle = {
    border: '1px solid rgb(228 228 228)',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px'
  };

  	// Helper: Count active filters
	const getActiveFilterCount = () => {
		return Object.values(tempFilters).filter(
			(value) => value && value.trim() !== ''
		).length;
	};
	// Apply filters: simple filtering based on tempFilters values
	const handleApplyFilters = () => {
		let filtered = usersLogs;
		Object.keys(tempFilters).forEach((key) => {
			if (tempFilters[key]) {
				filtered = filtered.filter((school) =>
					school[key]?.toString().toLowerCase().includes(tempFilters[key].toLowerCase())
				);
			}
		});
		setFilteredUsersLogs(filtered);
		setIsFilterVisible(false); // Close the sidebar after applying filters
	};
	const handleClearFilters = () => {
		setTempFilters({
			school_id: '',
			full_name: '',
			username: '',
			role: '',
		});
		setFilteredUsersLogs(usersLogs); // Reset to the original list
	};

  	/* ------------------------------ Fetch data ------------------------------ */
	// Common function to fetch data
	const fetchUsers = () => {
		setLoading(true);
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/usersLogs/list?lang=${i18n.language}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setUsersLogs(response.data);
				setFilteredUsersLogs(response.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching usersLogs:', err);
				setError(t('failed_to_fetch_data'));
				setLoading(false);
			});
	};
	// Fetch data whenever the language changes
	useEffect(() => {
		// Set loading to true whenever language changes
		setLoading(true);
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/usersLogs/list?lang=${i18n.language}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setUsersLogs(response.data);
				setFilteredUsersLogs(response.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching data:', err);
				setError(t('failed_to_fetch_data'));
				setLoading(false);
			});
	}, [i18n.language, t]);


  // Define columns for the datatable, including an Actions column with update trigger
	const columns = [
		{
			name: t('responsible_fullname'),
			selector: (row) => row.responsible_fullname,
			sortable: true,
		},
		{
			name: t('target_fullname'),
			selector: (row) => row.target_fullname,
			sortable: true,
		},
		{
			name: t('school_commercial_name'),
			selector: (row) => row.school_commercial_name,
			sortable: true,
		},
		{
			name: t('username'),
			selector: (row) => row.username,
			sortable: true,
		},
		{
			name: t('full_name'),
			selector: (row) => row.full_name,
			sortable: true,
		},
		{
			name: t('created_at'),
			selector: (row) => row.created_at,
			sortable: true,
		},
		{
			name: t('role_name'),
			selector: (row) => row.role_name,
			sortable: true,
		},
		{
			name: t('category'),
			selector: (row) => row.category,
			sortable: true,
		},
		{
			name: t('log_description'),
			selector: (row) => row.log_description,
			sortable: true,
		},
		{
			name: t('log_action'),
			selector: (row) => row.log_action,
			sortable: true,
		},
	];

	// Pagination options with translations
	const paginationOptions = {
		rowsPerPageText: t('rows_per_page'),
		rangeSeparatorText: t('of'),
		selectAllRowsItem: true,
		selectAllRowsItemText: t('all'),
	};

  return (
    <Layout pageTitle="Settings">
      <div className="container bg-white py-4">
        {/* Bootstrap Nav Tabs */}
        <ul className="nav nav-tabs" role="tablist"  style={{borderBottom:"1px solid rgb(228 228 228)"}}>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
              type="button"
              role="tab"
            >
              Profile
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
              type="button"
              role="tab"
            >
              System
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
              type="button"
              role="tab"
            >
              Contact Us
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content p-4">
          {/* Profile Tab */}
          <div className={`tab-pane fade ${activeTab === 'profile' ? 'show active' : ''}`} role="tabpanel">
            <h4>Profile Information</h4>
            {/* Group 1: Basic Info */}
            <div style={groupStyle}>
              <div className="col-md-4">
                <strong>{user.full_name}</strong>
              </div>
              <div className="col-md-4">
                <span>{user.username}</span>
              </div>
              <div className="col-md-4">
                <span>{user.role_name}</span>
              </div>
            </div>
            {/* Group 2: Personal Information */}
            <div style={groupStyle}>
              <h5 className='mb-4'>Personal Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-4">
                    <p className='mb-0'>First Name:</p>
                    <strong>{user.first_name}</strong>
                  </div>
                  
                  <div className="mb-4">
                    <p className='mb-0'>Mother's Last Name:</p>
                    <strong>{user.last_name_mother}</strong>
                  </div>

                  <div className="mb-4">
                    <p className='mb-0'>Father's Last Name:</p>
                    <strong>{user.last_name_father}</strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-4">
                    <p className='mb-0'>Email Address:</p>
                    <strong>{user.email}</strong>
                  </div>
                  
                  <div className="mb-4">
                    <p className='mb-0'>Phone:</p>
                    <strong>{user.phone_number || 'N/A'}</strong>
                  </div>
                    
                  <div className="mb-4">
                    <p className='mb-0'>School Commercial Name:</p>
                    <strong>{user.commercial_name}</strong>
                  </div>

                  <p className='mb-0'>CURP ID:</p>
                  <strong>{user.curp}</strong>
                </div>
              </div>
            </div>
            {/* Group 3: Address */}
            <div style={groupStyle}>
              <h5 className='mb-4'>Address</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-4">
                    <p className='mb-0'>City/State:</p>
                    <strong>{user.state || 'N/A'}</strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-4">
                    <p className='mb-0'>Postal Code:</p> 
                    <strong>N/A</strong>
                  </div>
                  <div className="mb-4">
                    <p className='mb-0'>Tax ID:</p>
                    <strong>{user.tax_id || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Tab */}
          <div className={`tab-pane fade ${activeTab === 'system' ? 'show active' : ''}`} role="tabpanel">
            <MDBRow className="d-flex justify-content-between align-items-center">
              <MDBCol className="col-auto">
                {t('system_logs')}
              </MDBCol>
              
              <MDBCol className="col-auto d-flex">
                {/* Export button */}
                <MDBBtn color='light' rippleColor='dark'>
                    <MDBIcon fas icon="download" className="me-1" />
                    {t('export')}
                </MDBBtn>
                {/* Filter button */}
                <MDBBtn color='light' rippleColor='dark'  onClick={toggleFilterVisibility}>
                  <MDBIcon fas icon="filter" className="me-1" />
                  {t('filter')} {getActiveFilterCount() > 0 ? `(${getActiveFilterCount()})` : ''}
                </MDBBtn>
              </MDBCol>
            </MDBRow>
            <DataTable
              // title={t('list')}
              columns={columns}
              data={filteredUsers}
              // progressPending={loading}
              pagination
              highlightOnHover
              responsive
              // selectableRows
              persistTableHead
              striped
              paginationComponentOptions={paginationOptions}
              noDataComponent={<NoDataComponent message={t('no_data_available')} body={t('no_data_available_body')} />}
              // conditionalRowStyles={conditionalRowStyles}
            />
          </div>

          {/* Contact Us Tab */}
          <div className={`tab-pane fade ${activeTab === 'contact' ? 'show active' : ''}`} role="tabpanel">
            <h4>Contact Us</h4>
            <p>Placeholder for Contact Us configuration settings.</p>
          </div>
        </div>
      </div>

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

export default ConfigPage;
