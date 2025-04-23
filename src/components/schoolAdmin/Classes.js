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
import MassStudentsUploadModal from '../common/MassStudentsUploadModal'; // Import your modal for mass student upload

const ClassesPage = () => {
	const { t, i18n } = useTranslation();
	const [classes, setClasses] = useState([]);
	const [filteredClasses, setFilteredClasses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// Modal states
	const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For Add School modal
	const [isFilterVisible, setIsFilterVisible] = useState(false); // For Filter modal
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // For Update School modal
	const [isSaving, setIsSaving] = useState(false);
	const [scholarLevels, setScholarLevels] = useState([]);
	const [schools, setSchools] = useState([]);
  
  // New state: for mass upload, we use the selected class (for school_id and group_id)
  const [isMassStudentsUploadModalOpen, setIsMassStudentsUploadModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);


	// Toggle functions
	const toggleAddModal = () => setIsAddModalOpen((prev) => !prev);
	const toggleUpdateModal = () => setIsUpdateModalOpen((prev) => !prev);
	const toggleFilterVisibility = () => setIsFilterVisible((prev) => !prev);

	// Form state for adding a new class
	const [newClass, setNewClass] = useState({
		school_id: '',
		schoolar_level_id: '',
		generation: '',
		group: '',
		grade: ''		
	});

	
	// Temporary filters state (keys must match class object properties)
	const [tempFilters, setTempFilters] = useState({
    generation: '',
    grade_group: '',
    scholar_level_name: '',
  });

	// Form fields to pass to the modal component
	const classFormGroups = [
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
					key: 'scholar_level_id', 
					label: 'scholar_level', 
					type: 'select',
					required: true,
					options: scholarLevels.map(scholarLevel => ({
						value: scholarLevel.scholarLevelId,
						label: scholarLevel.name
					}))
				},
			],
		},
		{
			groupTitle: 'class_info',
			columns: 3,
			fields: [
				{ key: 'generation', label: 'generation', type: 'text'},
				{ key: 'grade', label: 'grade', type: 'text'},
				{ key: 'group', label: 'group', type: 'text' },
			],
		},
	];

	// Handler for adding a new class (stub: implement API call as needed)
	const handleAdd = () => {
		// Implement axios.post(...) to add the new class.
		setIsSaving(true); // disable buttons and show spinner
		axios.post(`http://localhost:8080/api/groups/create?lang=${i18n.language}`, newClass, {
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
				fetchClasses(); // Refresh the table data
			}
			setIsSaving(false);
		})
		.catch((error) => {
			swal(t('error_title'), t('add_failed'), 'error');
			console.error('Error adding class:', error);
			setIsSaving(false);
		});
	};

	// Handler for updating a class: sends a PUT request with the pre-populated data
	const handleUpdate = () => {
		const token = localStorage.getItem('token');
		// Use school_id from selectedClass as identifier.
		setIsSaving(true); // disable buttons and show spinner
		axios
			.put(`http://localhost:8080/api/groups/update/${selectedClass.group_id}?lang=${i18n.language}`, 
			{
				scholar_level_id: selectedClass.scholar_level_id,
				generation: selectedClass.generation,
				group: selectedClass.group,
				grade: selectedClass.grade,
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
				fetchClasses(); // Refresh the table data after update
			}
			setIsSaving(false);
		})
		.catch((error) => {
			// Handle any network or unexpected errors.
			swal(t('error_title'), t('update_failed'), 'error');
			console.error('Error updating class:', error);
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
						`http://localhost:8080/api/groups/update/${selectedClass.group_id}/status?lang=${i18n.language}`,
						{},
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					.then((response) => {
						const resData = response.data;
						if (resData.success === false) {
							swal(resData.title, resData.message, resData.type);
						} else {
							swal(resData.title, resData.message, resData.type);
							// Optionally update the local status in selectedClass or re-fetch data:
							fetchClasses();
							setIsUpdateModalOpen(false);
						}
						setIsSaving(false);
					})
					.catch((error) => {
						swal(t('error_title'), t('update_failed'), 'error');
						console.error('Error updating class status:', error);
						setIsSaving(false);
					});
			} else {
				// If class cancels, you might want to revert the switch state.
				// For example, re-fetch selectedClass or simply do nothing.
				fetchClasses();
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
		let filtered = classes;
		Object.keys(tempFilters).forEach((key) => {
			if (tempFilters[key]) {
				filtered = filtered.filter((school) =>
					school[key]?.toString().toLowerCase().includes(tempFilters[key].toLowerCase())
				);
			}
		});
		setFilteredClasses(filtered);
		setIsFilterVisible(false); // Close the sidebar after applying filters
	};
	const handleClearFilters = () => {
		setTempFilters({
			generation: '',
			grade_group: '',
			scholar_level_name: '',
		});
		setFilteredClasses(classes); // Reset to the original list
	};


	/* ------------------------------ Fetch data ------------------------------ */
	// Common function to fetch data
	const fetchClasses = () => {
		setLoading(true);
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/groups/list?&lang=${i18n.language}&status_filter=-1`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setClasses(response.data);
				setFilteredClasses(response.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error('Error fetching classes:', err);
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
			.get(`http://localhost:8080/api/groups/list?lang=${i18n.language}&status_filter=-1`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((response) => {
				setClasses(response.data);
				setFilteredClasses(response.data);
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
	
	// Fetch school levels
	useEffect(() => {
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/scholar-levels/list?lang=${i18n.language}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then(response => {
				setScholarLevels(response.data);
			})
			.catch(err => {
				console.error("Error fetching schoolar levels:", err);
			});
	}, [i18n.language]);

	// Define columns for the datatable, including an Actions column with update trigger
	const columns = [
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
			name: t('scholar_level_name'),
			selector: (row) => row.scholar_level_name,
			sortable: true,
		},
		{
			name: t('status'),
			selector: (row) => row.group_status,
			sortable: true,
		},
		{
			name: t('actions'),
			cell: (row) => (
        <div className='d-flex gap-1'>
          <MDBBtn 
						flat="true" 
						size="sm" 
						onClick={() => {
							setSelectedClass(row);
							toggleUpdateModal();
						}}
					>
            <MDBIcon fas icon="pen" className="cursor-pointer" />
          </MDBBtn>
          <MDBBtn 
						flat="true" 
						size="sm" 
						color="light" 
						onClick={() => {
							// Set the selected class for mass student upload and open the modal
							setSelectedClass(row);
							setIsMassStudentsUploadModalOpen(true);
						}}
					>
            <MDBIcon fas icon="upload" className="me-1" />
            {t('import_students')}
          </MDBBtn>
					{/* Generate paymente request button */}
					<MDBBtn 
						flat="true" 
						size="sm" 
						color="light" 
						rippleColor="dark" 
						// onClick={() => setIsMassTeachersUploadModalOpen(true)}
					>
						<MDBIcon fas icon="hand-holding-usd" className="me-1" />
						{t('generate_payment_request')}
					</MDBBtn>
        </div>
      ),
			ignoreRowClick: true,
			// 1) you can use width or minWidth:
			width: '400px',
			// 2) both cell _and_ header need nowrap
			style:      { whiteSpace: 'nowrap' },      // applies to each cell
			headerStyle:{ whiteSpace: 'nowrap' },      // applies to the header
			// 3) tells the table this is a button-ish column
			button:     true,
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
	const csvData = filteredClasses.map((data) => ({
		[t('school_description')]: data.school_description,
		[t('generation')]: data.generation,
		[t('grade_group')]: data.grade_group,
		[t('scholar_level_name')]: data.scholar_level_name,
		[t('group_status')]: data.group_status,
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

  // if (loading) {
  //   return (
  //     <MDBContainer className="text-center py-5">
  //       <MDBSpinner size="lg" />
  //     </MDBContainer>
  //   );
  // }

	return (
		<Layout pageTitle={t('classes')}>
			<MDBContainer className="py-4">
				{/* Header Row with Export, Add, Filter buttons */}
				<MDBRow className='mb-4'>
					<MDBCol>
						<MDBCard>
							<MDBCardHeader>
								<MDBRow className="d-flex justify-content-between align-items-center">
									<MDBCol className="col-auto">
										{t('classes_list')}
									</MDBCol>
									
									<MDBCol className="col-auto d-flex">
										{/* Export button */}
										<CSVLink 
											data={csvData} 
											filename="classes.csv"
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
									data={filteredClasses}
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
				formGroups={classFormGroups}
				data={newClass}
				setData={setNewClass}
				onSave={handleAdd}
				title={t('add_class')}
				size="xl"
				idPrefix="create_"
				isSaving={isSaving}
			/>
			
			{/* Update School Modal (XL size) */}
			<FormModal
				open={isUpdateModalOpen}
				onClose={toggleUpdateModal}
				formGroups={classFormGroups}
				data={selectedClass}
				setData={setSelectedClass}
				onSave={handleUpdate}
				title={t('update_class')}
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

      {/* Mass Students Upload Modal for Classes */}
      {isMassStudentsUploadModalOpen && selectedClass && (
        <MassStudentsUploadModal 
          open={isMassStudentsUploadModalOpen} 
          onClose={() => setIsMassStudentsUploadModalOpen(false)} 
          school_id={selectedClass.school_id}
          group_id={selectedClass.group_id}
          onUploadSuccess={fetchClasses}
        />
      )}
		</Layout>
	);
};

export default ClassesPage;
