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

const StudentsPage = () => {
	const { t, i18n } = useTranslation();
	const [students, setStudents] = useState([]);
	const [filteredStudents, setFilteredStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// Modal states
	const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For Add School modal
	const [isFilterVisible, setIsFilterVisible] = useState(false); // For Filter modal
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // For Update School modal
	const [isSaving, setIsSaving] = useState(false);
	const [groups, setGroups] = useState([]);
	const [schools, setSchools] = useState([]);

	// Form state for updating a user (pre-populated when clicking actions)
	const [selectedStudent, setSelectedStudent] = useState(null);

	// Form state for adding a new user
	const [newStudent, setNewStudent] = useState({
		person_id: '',
		school_id: '',
		role_id: '',
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

	// Helper function to fetch groups based on school_id
	const fetchGroupsForSchool = (schoolId) => {
			if (!schoolId) {
					setGroups([]);
					return;
			}
			const token = localStorage.getItem('token');
			axios
				.get(`http://localhost:8080/api/groups/list?school_id=${schoolId}&lang=${i18n.language}&status_filter=1`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then((response) => {
					setGroups(response.data);
				})
				.catch((err) => {
					console.error("Error fetching groups:", err);
					setGroups([]);
				});
		};

	// When adding a new student, fetch groups when newStudent.school_id changes
	useEffect(() => {
			if (newStudent.school_id) {
				// Clear previous groups
				setGroups([]);
				fetchGroupsForSchool(newStudent.school_id);
			} else {
				setGroups([]);
			}
		}, [newStudent.school_id, i18n.language]);
	
	// Similarly, when updating a student, fetch groups when selectedStudent.school_id changes
	useEffect(() => {
			if (selectedStudent && selectedStudent.school_id) {
				// Clear previous groups
				setGroups([]);
				fetchGroupsForSchool(selectedStudent.school_id);
			} else {
				setGroups([]);
			}
		}, [selectedStudent && selectedStudent.school_id, i18n.language]);

	// Toggle functions
	const toggleAddModal = () => setIsAddModalOpen((prev) => !prev);
	const toggleUpdateModal = () => setIsUpdateModalOpen((prev) => !prev);
	const toggleFilterVisibility = () => setIsFilterVisible((prev) => !prev);

	
	// Temporary filters state (keys must match user object properties)
	const [tempFilters, setTempFilters] = useState({
		full_name: '',
		payment_reference: '',
		username: '',
		grade_group: '',
		commercial_name: '',
	});
	const handleClearFilters = () => {
		setTempFilters({
			full_name: '',
			payment_reference: '',
			username: '',
			grade_group: '',
			commercial_name: '',
		});
		setFilteredStudents(students); // Reset to the original list
	};

	// Add user form fields to pass to the modal component
	const addStudentFormGroups = [
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
					key: 'group_id', 
					label: 'group_id', 
					type: 'select',
					required: true,
					options: groups.map(group => ({
						value: group.group_id,
						label: group.generation+" | "+group.grade_group+" | "+group.scholar_level_name
					}))
				},
			],
		},
		{
			groupTitle: 'student_info',
			columns: 3,
			fields: [
				{ key: 'register_id', label: 'register_id', type: 'text', required: true},
				{ key: 'payment_reference', label: 'payment_reference', type: 'text', required: true },
        { key: 'tuition', label: 'tuition', type: 'number' },
			],
		},
		{
			groupTitle: 'additional_info',
			columns: 4,
			fields: [
				{ key: 'birth_date', label: 'birth_date', type: 'date' },
				{ key: 'phone_number', label: 'phone_number', type: 'text' },
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
	const updateStudentFormGroups = [
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
					key: 'group_id', 
					label: 'group_id', 
					type: 'select',
					required: true,
					options: groups.map(group => ({
						value: group.group_id,
						label: group.generation+" | "+group.grade_group+" | "+group.scholar_level_name
					}))
				},
			],
		},
		{
			groupTitle: 'student_info',
			columns: 3,
			fields: [
				{ key: 'register_id', label: 'register_id', type: 'text'},
				{ key: 'payment_reference', label: 'payment_reference', type: 'text' },
        { key: 'tuition', label: 'tuition', type: 'number' },
			],
		},
		{
			groupTitle: 'additional_info',
			columns: 3,
			fields: [
				{ key: 'birth_date', label: 'birth_date', type: 'date'},
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
		axios.post(`http://localhost:8080/api/students/create?lang=${i18n.language}`, newStudent, {
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
				fetchStudents(); // Refresh the table data
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
		// Use school_id from selectedStudent as identifier.
		setIsSaving(true); // disable buttons and show spinner
		axios
			.put(`http://localhost:8080/api/students/update/${selectedStudent.user_id}?lang=${i18n.language}`, 
			{
				school_id: selectedStudent.school_id,
				group_id: selectedStudent.group_id,
				register_id: selectedStudent.register_id,
				payment_reference: selectedStudent.payment_reference,
				first_name: selectedStudent.first_name,
				last_name_father: selectedStudent.last_name_father,
				last_name_mother: selectedStudent.last_name_mother,
				birth_date: selectedStudent.birth_date,
				phone_number: selectedStudent.phone_number,
				tax_id: selectedStudent.tax_id,
				curp: selectedStudent.curp,
				street: selectedStudent.street,
				ext_number: selectedStudent.ext_number,
				int_number: selectedStudent.int_number,
				suburb: selectedStudent.suburb,
				locality: selectedStudent.locality,
				municipality: selectedStudent.municipality,
				state: selectedStudent.state,
				personal_email: selectedStudent.personal_email,
				image: selectedStudent.image,
				email: selectedStudent.email,
				tuition: selectedStudent.tuition,
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
				fetchStudents(); // Refresh the table data after update
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
						`http://localhost:8080/api/users/update/${selectedStudent.user_id}/status?lang=${i18n.language}`,
						{},
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					.then((response) => {
						const resData = response.data;
						if (resData.success === false) {
							swal(resData.title, resData.message, resData.type);
						} else {
							swal(resData.title, resData.message, resData.type);
							// Optionally update the local status in selectedStudent or re-fetch data:
							fetchStudents();
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
				// For example, re-fetch selectedStudent or simply do nothing.
				fetchStudents();
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
		let filtered = students;
		Object.keys(tempFilters).forEach((key) => {
			if (tempFilters[key]) {
				filtered = filtered.filter((school) =>
					school[key]?.toString().toLowerCase().includes(tempFilters[key].toLowerCase())
				);
			}
		});
		setFilteredStudents(filtered);
		setIsFilterVisible(false); // Close the sidebar after applying filters
	};


	/* ------------------------------ Fetch data ------------------------------ */
	// Common function to fetch data
	const fetchStudents = () => {
		setLoading(true);
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/students/list?lang=${i18n.language}&status_filter=-1&getRole=workers`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setStudents(response.data);
				setFilteredStudents(response.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching students:', err);
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
			.get(`http://localhost:8080/api/students/list?lang=${i18n.language}&status_filter=-1&getRole=workers`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setStudents(response.data);
				setFilteredStudents(response.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching data:', err);
				setError(t('failed_to_fetch_data'));
				setLoading(false);
			});
	}, [i18n.language, t]);


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
			name: t('payment_reference'),
			selector: (row) => row.payment_reference,
			sortable: true,
		},
		{
			name: t('scholar_level_name'),
			selector: (row) => row.scholar_level_name,
			sortable: true,
		},
		{
			name: t('generation'),
			selector: (row) => row.generation,
			sortable: true,
		},
		{
			name: t('grade_group'),
			selector: (row) => row.grade_group,
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
			name: t('group_status'),
			selector: (row) => row.group_status,
			sortable: true,
		},
		{
			name: t('actions'),
			cell: (row) => (
				<MDBBtn flat="true" size="sm" onClick={() => {
					setSelectedStudent(row);
					toggleUpdateModal();
				}}>
					<MDBIcon
					fas
					icon="pen"
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
	const csvData = filteredStudents.map((student) => ({
		[t('user_id')]: student.user_id,
		[t('student_id')]: student.student_id,
		[t('full_name')]: student.full_name,
		[t('payment_reference')]: student.payment_reference,
		[t('username')]: student.username,
		[t('scholar_level_name')]: student.scholar_level_name,
		[t('generation')]: student.generation,
		[t('grade_group')]: student.grade_group,
		[t('commercial_name')]: student.commercial_name,
		[t('user_status')]: student.user_status,
		[t('group_status')]: student.group_status,
	}));

	const conditionalRowStyles = [
		{
			when: row => row.user_enabled === false ||row.role_enabled === false ||row.group_enabled === false ||row.school_enabled === false, // adjust condition based on your data type
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
		<Layout pageTitle={t('students')}>
			<MDBContainer className="py-4">
				{/* Header Row with Export, Add, Filter buttons */}
				<MDBRow className='mb-4'>
					<MDBCol>
						<MDBCard>
							<MDBCardHeader>
								<MDBRow className="d-flex justify-content-between align-items-center">
									<MDBCol className="col-auto">
										{t('students_list')}
									</MDBCol>
									
									<MDBCol className="col-auto d-flex">
										{/* Export button */}
										<CSVLink 
											data={csvData} 
											filename="students.csv"
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
									data={filteredStudents}
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
				formGroups={addStudentFormGroups}
				data={newStudent}
				setData={setNewStudent}
				onSave={handleAddUser}
				title={t('add_student')}
				size="xl"
				idPrefix="create_"
				isSaving={isSaving}
			/>
			
			{/* Update School Modal (XL size) */}
			<FormModal
				open={isUpdateModalOpen}
				onClose={toggleUpdateModal}
				formGroups={updateStudentFormGroups}
				data={selectedStudent}
				setData={setSelectedStudent}
				onSave={handleUpdateUser}
				title={t('update_student')}
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

export default StudentsPage;
