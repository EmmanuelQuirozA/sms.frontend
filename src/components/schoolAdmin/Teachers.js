import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../Layout';
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
import FiltersSidebar from '../FiltersSidebar';
import swal from 'sweetalert';
import FormModal from '../FormModal';
import NoDataComponent from '../NoDataComponent';

const TeachersPage = () => {
	const { t, i18n } = useTranslation();
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// Modal states
	const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For Add School modal
	const [isFilterVisible, setIsFilterVisible] = useState(false); // For Filter modal
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // For Update School modal
	const [isSaving, setIsSaving] = useState(false);
	const [roles, setRoles] = useState([]);
	const [schools, setSchools] = useState([]);

	// Toggle functions
	const toggleAddModal = () => setIsAddModalOpen((prev) => !prev);
	const toggleUpdateModal = () => setIsUpdateModalOpen((prev) => !prev);
	const toggleFilterVisibility = () => setIsFilterVisible((prev) => !prev);

	
	// Form state for updating a user (pre-populated when clicking actions)
	const [selectedUser, setSelectedUser] = useState(null);
	// Temporary filters state (keys must match user object properties)
	const [tempFilters, setTempFilters] = useState({
		school_id: '',
		full_name: '',
		username: '',
		role: '',
	});
	// Form state for adding a new user
	const [newUser, setNewUser] = useState({
		person_id: '',
		school_id: '',
		role_id: 2,
		email: '',
		username: '',
		role_name: '',
		full_name: '',
		address: '',
		commercial_name: '',
		business_name: '',
		first_name: '',
		last_name_father: '',
		last_name_mother: '',
		birth_date: '',
		phone_number: '',
		tax_id: '',
		street: '',
		ext_number: '',
		int_number: '',
		suburb: '',
		locality: '',
		municipality: '',
		state: '',
		personal_email: '',
		image: '',
		user_enabled: '',
		role_enabled: '',
		school_enabled: '',
		birth_date_formated: '',
		user_status: '',
		role_status: '',
		school_status: ''
		
	});

	// Add user form fields to pass to the modal component
	const addUserFormGroups = [
		{
			groupTitle: 'user_info',
			columns: 1,
			fields: [
				{
					// This object is a nested container (no key provided) that groups two nested groups
					columns: 1,
					fields: [
						{
							groupTitle: 'full_name',
							columns: 3,
							fields: [
								{ key: 'first_name', label: 'first_name', type: 'text', required: true },
								{ key: 'last_name_father', label: 'last_name_father', type: 'text', required: true },
								{ key: 'last_name_mother', label: 'last_name_mother', type: 'text', required: true },
							],
						},
						{
							groupTitle: 'user_info',
							columns: 2,
							fields: [
								{ key: 'username', label: 'username', type: 'text', required: true },
								{ key: 'password', label: 'password', type: 'password', required: true },
							],
						},
					]
				}
			],
		},
		{
			groupTitle: 'general_info', // translation key for group title
			columns: 1,
			fields: [
				{ 
					key: 'school_id', 
					label: 'school', 
					type: 'select',
					required: true,
					options: schools.map(school => ({
						value: school.school_id,
						label: school.description
					}))
				},
			],
		},
		{
			groupTitle: 'additional_info',
			columns: 3,
			fields: [
				{ key: 'birth_date', label: 'birth_date', type: 'date' },
				{ key: 'tax_id', label: 'tax_id', type: 'text' },
				{ key: 'curp', label: 'curp', type: 'text' },
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
				{ key: 'personal_email', label: 'personal_email', type: 'email' },
				{ key: 'email', label: 'email', type: 'email', required: true },
				{ key: 'phone_number', label: 'phone_number', type: 'tel' },
			],
		}
	];

	// Update user form fields to pass to the modal component
	const updateUserFormGroups = [
		{
			groupTitle: 'user_info',
			columns: 3,
			fields: [
				{ key: 'first_name', label: 'first_name', type: 'text', required: true },
				{ key: 'last_name_father', label: 'last_name_father', type: 'text', required: true },
				{ key: 'last_name_mother', label: 'last_name_mother', type: 'text', required: true },
			]
		},
		{
			groupTitle: 'general_info', // translation key for group title
			columns: 2,
			fields: [
				{ 
					key: 'school_id', 
					label: 'school_id', 
					type: 'select',
					required: true,
					options: schools.map(school => ({
						value: school.school_id,
						label: school.description
					}))
				},
				{ 
					key: 'role_id', 
					label: 'role_id', 
					type: 'select',
					required: true,
					options: roles.map(role => ({
						value: role.role_id,
						label: role.role_name
					}))
				},
			],
		},
		{
			groupTitle: 'additional_info',
			columns: 3,
			fields: [
				{ key: 'birth_date', label: 'birth_date', type: 'date' },
				{ key: 'tax_id', label: 'tax_id', type: 'text' },
				{ key: 'curp', label: 'curp', type: 'text' },
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
				{ key: 'personal_email', label: 'personal_email', type: 'email' },
				{ key: 'email', label: 'email', type: 'email', required: true },
				{ key: 'phone_number', label: 'phone_number', type: 'tel' },
			],
		}
	];

	// Handler for adding a new user (stub: implement API call as needed)
	const handleAddUser = () => {
		// Implement axios.post(...) to add the new user.
		setIsSaving(true); // disable buttons and show spinner
		axios.post(`http://localhost:8080/api/users/create?lang=${i18n.language}`, newUser, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		})
		.then((response) => {
			const resData = response.data;
			if (resData.success === false) {
				// For warnings or error messages returned from the SP, display SweetAlert with the provided type/title/message.
				swal(resData.title, resData.message, resData.type);
			} else {
				// If success is true, show a success alert and close the modal.
				swal(resData.title, resData.message, resData.type);
				toggleAddModal();
				fetchUsers(); // Refresh the table data
			}
			setIsSaving(false);
		})
		.catch((error) => {
			swal(t('error_title'), t('add_failed'), 'error');
			console.error('Error adding user:', error);
			setIsSaving(false);
		});
	};

	// Handler for updating a user: sends a PUT request with the pre-populated data
	const handleUpdateUser = () => {
		const token = localStorage.getItem('token');
		// Use school_id from selectedUser as identifier.
		setIsSaving(true); // disable buttons and show spinner
		axios
			.put(`http://localhost:8080/api/users/update/${selectedUser.user_id}?lang=${i18n.language}`, 
			{
				school_id: selectedUser.school_id,
				role_id: selectedUser.role_id,
				first_name: selectedUser.first_name,
				last_name_father: selectedUser.last_name_father,
				last_name_mother: selectedUser.last_name_mother,
				birth_date: selectedUser.birth_date,
				phone_number: selectedUser.phone_number,
				tax_id: selectedUser.tax_id,
				curp: selectedUser.curp,
				street: selectedUser.street,
				ext_number: selectedUser.ext_number,
				int_number: selectedUser.int_number,
				suburb: selectedUser.suburb,
				locality: selectedUser.locality,
				municipality: selectedUser.municipality,
				state: selectedUser.state,
				personal_email: selectedUser.personal_email,
				image: selectedUser.image,
				email: selectedUser.email,
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
				fetchUsers(); // Refresh the table data after update
			}
			setIsSaving(false);
		})
		.catch((error) => {
			// Handle any network or unexpected errors.
			swal(t('error_title'), t('update_failed'), 'error');
			console.error('Error updating user:', error);
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
						`http://localhost:8080/api/users/update/${selectedUser.user_id}/status?lang=${i18n.language}`,
						{},
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					.then((response) => {
						const resData = response.data;
						if (resData.success === false) {
							swal(resData.title, resData.message, resData.type);
						} else {
							swal(resData.title, resData.message, resData.type);
							// Optionally update the local status in selectedUser or re-fetch data:
							fetchUsers();
							setIsUpdateModalOpen(false);
						}
						setIsSaving(false);
					})
					.catch((error) => {
						swal(t('error_title'), t('update_failed'), 'error');
						console.error('Error updating user status:', error);
						setIsSaving(false);
					});
			} else {
				// If user cancels, you might want to revert the switch state.
				// For example, re-fetch selectedUser or simply do nothing.
				fetchUsers();
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
		let filtered = users;
		Object.keys(tempFilters).forEach((key) => {
			if (tempFilters[key]) {
				filtered = filtered.filter((school) =>
					school[key]?.toString().toLowerCase().includes(tempFilters[key].toLowerCase())
				);
			}
		});
		setFilteredUsers(filtered);
		setIsFilterVisible(false); // Close the sidebar after applying filters
	};
	const handleClearFilters = () => {
		setTempFilters({
			school_id: '',
			full_name: '',
			username: '',
			role: '',
		});
		setFilteredUsers(users); // Reset to the original list
	};


	/* ------------------------------ Fetch data ------------------------------ */
	// Common function to fetch data
	const fetchUsers = () => {
		setLoading(true);
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/users/list?lang=${i18n.language}&status_filter=-1&getRole=teachers`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setUsers(response.data);
				setFilteredUsers(response.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching users:', err);
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
			.get(`http://localhost:8080/api/users/list?lang=${i18n.language}&status_filter=-1&getRole=teachers`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setUsers(response.data);
				setFilteredUsers(response.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching data:', err);
				setError(t('failed_to_fetch_data'));
				setLoading(false);
			});
	}, [i18n.language, t]);

	// Fetch roles
	useEffect(() => {
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/roles/list?lang=${i18n.language}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then(response => {
				setRoles(response.data);
			})
			.catch(err => {
				console.error("Error fetching roles:", err);
			});
	}, [i18n.language]);

	// Fetch schools
	useEffect(() => {
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/schools/list?lang=${i18n.language}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then(response => {
				setSchools(response.data);
			})
			.catch(err => {
				console.error("Error fetching schools:", err);
			});
	}, [i18n.language]);

	// Define columns for the datatable, including an Actions column with update trigger
	const columns = [
		{
			name: t('full_name'),
			selector: (row) => row.full_name,
			sortable: true,
		},
		{
			name: t('username'),
			selector: (row) => row.username,
			sortable: true,
		},
		{
			name: t('role_name'),
			selector: (row) => row.role_name,
			sortable: true,
		},
		{
			name: t('school'),
			selector: (row) => row.commercial_name,
			sortable: true,
		},
		{
			name: t('user_status'),
			selector: (row) => row.user_status,
			sortable: true,
		},
		{
			name: t('actions'),
			cell: (row) => (
				<MDBBtn flat="true" size="sm" onClick={() => {
					setSelectedUser(row);
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
	const csvData = filteredUsers.map((user) => ({
		[t('user_id')]: user.user_id,
		[t('full_name')]: user.full_name,
		[t('username')]: user.username,
		[t('role_name')]: user.role_name,
		[t('address')]: user.address,
		[t('user_status')]: user.user_status,
		[t('role_status')]: user.role_status,
		[t('school_status')]: user.school_status,
	}));

	const conditionalRowStyles = [
		{
			when: row => row.user_enabled === false ||row.role_enabled === false ||row.school_enabled === false, // adjust condition based on your data type
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
		<Layout pageTitle={t('teachers')}>
			<MDBContainer className="py-4">
				{/* Header Row with Export, Add, Filter buttons */}
				<MDBRow>
					<MDBCol>
						<MDBCard>
							<MDBCardHeader>
								<MDBRow className="d-flex justify-content-between align-items-center">
									<MDBCol className="col-auto">
										{t('teachers_list')}
									</MDBCol>
									
									<MDBCol className="col-auto d-flex">
										{/* Export button */}
										<CSVLink 
											data={csvData} 
											filename="teachers.csv"
											style={{ textDecoration: 'none', color: 'inherit' }}
										>
											<MDBBtn color='light' rippleColor='dark'>
													<MDBIcon fas icon="download" className="me-1" />
													{t('export')}
											</MDBBtn>
										</CSVLink>
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
									// title={t('list')}
									columns={columns}
									data={filteredUsers}
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
				formGroups={addUserFormGroups}
				data={newUser}
				setData={setNewUser}
				onSave={handleAddUser}
				title={t('add_teacher')}
				size="xl"
				idPrefix="create_"
				isSaving={isSaving}
			/>
			
			{/* Update School Modal (XL size) */}
			<FormModal
				open={isUpdateModalOpen}
				onClose={toggleUpdateModal}
				formGroups={updateUserFormGroups}
				data={selectedUser}
				setData={setSelectedUser}
				onSave={handleUpdateUser}
				title={t('update_teacher')}
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

export default TeachersPage;
