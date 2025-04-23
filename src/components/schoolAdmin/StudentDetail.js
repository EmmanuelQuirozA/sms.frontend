// src/pages/StudentDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
	MDBContainer,
	MDBRow,
	MDBCol,
	MDBCard,
	MDBCardHeader,
	MDBCardBody,
	MDBSpinner,
	MDBIcon,
	MDBBtn,
	MDBInput
} from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import FormModal from '../common/FormModal';
import DetailsModal from '../common/DetailsModal';
import NoDataComponent from '../../components/NoDataComponent';

const StudentDetail = () => {
	const { studentId } = useParams();
	const { t, i18n } = useTranslation();

	// --- Separate Loading States ---
	const [studentLoading, setStudentLoading] = useState(true);  // For student details
	const [monthlyLoading, setMonthlyLoading] = useState(true);  // For monthly report table
	const [paymentsLoading, setPaymentsLoading] = useState(true);  // For payments list (if needed)

	// --- Data States ---
	const [student, setStudent] = useState(null);
	const [payments, setPayments] = useState([]);
	const [error, setError] = useState('');

	// ------------------- Monthly Report States ----------------------
	const [reportData, setReportData] = useState([]); // raw data from report API
	const [filteredMonthlyReport, setFilteredMonthlyReport] = useState([]); // data to show in report
	const [reportColumns, setReportColumns] = useState([]);

	// ------------------- StudentsBalance recharges States ----------------------
	const [balanceRecharges, setStudentsBalanceRecharges] = useState([]);
	const [balanceLoading, setStudentsBalanceLoading] = useState(true);

	// ------------------- Filter states for date ----------------------
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [showDebtOnly, setShowDebtOnly] = useState(false);

	// ------------------- Modal states for payment detail modal ----------------------
	const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
	const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);

	// ------------------- Existing Modal and Helper States ----------------------
	const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For Add modal
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // For Update modal
	const [selectedStudent, setSelectedPayment] = useState(null);
	
	// Toggle modal functions
	const toggleAddModal = () => setIsAddModalOpen(prev => !prev);
	const togglePaymentDetailModal = () => setIsPaymentDetailModalOpen(prev => !prev);
	const toggleUpdateModal = () => setIsUpdateModalOpen((prev) => !prev);

	// Style for each group
	const groupStyle = {
		borderBottom: '1px solid rgb(228 228 228)',
		marginBottom: '15px'
	};

	// Prepare CSV data
	const csvData = payments.map((student) => ({
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

	// Helper function to format dates/datetimes
	const formatDateTime = (value) => {
		if (!value) return '';
		const date = new Date(value);
		if (i18n.language === 'es') {
			const formatted = new Intl.DateTimeFormat('es-ES', { 
				day: '2-digit', 
				month: 'long', 
				year: 'numeric', 
				hour: '2-digit', 
				minute: '2-digit' 
			}).format(date);
			return formatted.replace(/ de (\d{4})$/, ' del $1');
		} else {
			return new Intl.DateTimeFormat('en-US', { 
				month: 'long', 
				day: '2-digit', 
				year: 'numeric', 
				hour: '2-digit', 
				minute: '2-digit' 
			}).format(date);
		}
	};

	// Helper function to format dates/datetimes
	const formatDateMonth = (value) => {
		if (!value) return '';
		const date = new Date(value);
		if (i18n.language === 'es') {
			const formatted = new Intl.DateTimeFormat('es-ES', { 
				day: '2-digit', 
				month: 'long', 
				year: 'numeric'
			}).format(date);
			return formatted.replace(/ de (\d{4})$/, ' del $1');
		} else {
			return new Intl.DateTimeFormat('en-US', { 
				day: '2-digit', 
				month: 'long', 
				year: 'numeric'
			}).format(date);
		}
	};

	// paymentDetailFormGroups used by the FormModal
	const paymentDetailFormGroups = [
		{
			groupTitle: 'student', // translation key for group title
			columns: 2,
			fields: [
				{ key: 'full_name', label: 'full_name', type: 'text' },
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
			columns: 3,
			fields: [
				{ key: 'payment_id', label: 'payment_id', type: 'number' },
				{ key: 'pt_name', label: 'pt_name', type: 'number' },
				{ key: 'amount', label: 'amount', type: 'number' },
				{ key: 'payment_month', label: 'payment_month', type: 'date' },
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
	
	// Fetch student detail (only once, when component loads or studentId changes)
	useEffect(() => {
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/students/list?lang=${i18n.language}&student_id=${studentId}&status_filter=-1`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then(response => {
				const data = Array.isArray(response.data) ? response.data[0] : response.data;
				setStudent(data);
				setStudentLoading(false);
			})
			.catch(err => {
				console.error("Error fetching student details:", err);
				setError(t("failed_to_fetch_data"));
				setStudentLoading(false);
			});
	}, [studentId, i18n.language, t]);

	// ------------------- Fetch Payments (if needed) ----------------------
	const fetchPayments = () => {
		setPaymentsLoading(true);
		const token = localStorage.getItem('token');
		axios
			.get(`http://localhost:8080/api/reports/paymentdetails?lang=${i18n.language}&student_id=${studentId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then(response => {
				setPayments(response.data);
				setPaymentsLoading(false);
			})
			.catch(err => {
				console.error('Error fetching payments:', err);
				setError(t('failed_to_fetch_data'));
				setPaymentsLoading(false);
			});
	};

	// Fetch payments initially and whenever searchQuerys changes (with at least 2 characters)
	useEffect(() => {
		fetchPayments();
	}, [i18n.language, t, studentId]);

	//////////////////////////////////////////////////////////////////////////////
		// FETCH REPORT DATA (updated to include optional student_id, start_date, and end_date)
		//////////////////////////////////////////////////////////////////////////////
		useEffect(() => {
			setMonthlyLoading(true);
			const token = localStorage.getItem('token');
			// Start building URL with mandatory parts
			let url = `http://localhost:8080/api/reports/payments/report?lang=${i18n.language}`;
	
			// Append student_id if provided
			if (studentId && studentId.trim() !== '') {
				url += `&student_id=${studentId}`;
			}
			// Append start_date if provided (using "-01" for the first day of the month)
			if (startDate && endDate) {
				url += `&start_date=${startDate}-01`;
				const [year, month] = endDate.split('-');
				const lastDay = new Date(year, month, 0).getDate(); // new Date(year, month, 0) gives the last day of that month
				const formattedLastDay = lastDay < 10 ? `0${lastDay}` : lastDay;
				url += `&end_date=${endDate}-${formattedLastDay}`;
			}
			// Append end_date if provided (compute last day of the selected month)
			// if (endDate) {
			// 	const [year, month] = endDate.split('-');
			// 	const lastDay = new Date(year, month, 0).getDate(); // new Date(year, month, 0) gives the last day of that month
			// 	const formattedLastDay = lastDay < 10 ? `0${lastDay}` : lastDay;
			// 	url += `&end_date=${endDate}-${formattedLastDay}`;
			// }
	
			axios
				.get(url, { headers: { Authorization: `Bearer ${token}` } })
				.then(response => {
					setReportData(response.data);
					setMonthlyLoading(false);
				})
				.catch(err => {
					console.error('Error fetching report:', err);
					setError(t('failed_to_fetch_data'));
					setMonthlyLoading(false);
				});
		}, [i18n.language, t, studentId, startDate, endDate]);

	// ------------------- Build Report Columns Dynamically ----------------------
	// Fixed keys for filtering and visible columns (excluding "school_id")
	const filterKeys = ['school_id', 'student', 'payment_reference', 'generation', 'class', 'scholar_level', 'u_enabled', 'g_enabled'];
	const visibleFixedKeys = filterKeys.filter(key => key !== 'school_id' && key !== 'u_enabled' && key !== 'g_enabled');
	const monthMapping = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };

	// Utility: Translate a month column header (e.g., "Jan-25" to localized string)
	const translateMonthColumn = (key) => {
		const parts = key.split('-');
		if (parts.length === 2) {
			const monthAbbrev = parts[0].toLowerCase();
			let year = parts[1];
			if (year.length === 2) { year = "20" + year; }
			return `${t(`month.${monthAbbrev}`)}-${year}`;
		}
		return t(key);
	};

	// Utility: Convert a key like "Jan-25" to "2025-01"
	const convertKeyToDate = (key) => {
		const parts = key.split('-');
		if (parts.length === 2) {
			const mon = parts[0].toLowerCase();
			let year = parts[1];
			// If year is two digits, assume it's in the 2000s
			if (year.length === 2) {
				year = "20" + year;
			}
			return `${year}-${monthMapping[mon] || "01"}`;
		}
		return null;
	};

	// Utility: Generate a month range array given a start and end in "YYYY-MM" format
	const generateMonthRange = (start, end) => {
		const result = [];
		const [startYear, startMonth] = start.split('-').map(Number);
		const [endYear, endMonth] = end.split('-').map(Number);
		let currentYear = startYear;
		let currentMonth = startMonth; // 1-12
		const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
			const monthName = monthNames[currentMonth - 1];
			// Get the last two digits of the year
			const yearShort = String(currentYear).slice(-2);
			result.push(`${monthName}-${yearShort}`);
			currentMonth++;
			if (currentMonth > 12) { currentMonth = 1; currentYear++; }
		}
		return result;
	};


	// In this example we assume the report data returns objects with keys you want to show
	useEffect(() => {
		if (reportData.length === 0) return;
		const allKeys = Object.keys(reportData[0]);
		// Build fixed columns
		const fixedColumns = visibleFixedKeys
			.filter(key => allKeys.includes(key))
			.map(key => {
				// For the "student" column, display the full name (split by "-")
				if (key === 'student') {
					return {
				name: t(key),
				selector: row => row[key],
				sortable: true,
						cell: row => {
							let displayName = row.student;
							if (row.student && row.student.includes('-')) {
								const parts = row.student.split('-');
								displayName = parts.slice(1).join('-');
							}
							return (
								<span
									className='p-1'
								>
									{displayName}
								</span>
							);
						},
						width: '275px'  // Set the student name column width here
					};
				}
				return {
					name: t(key),
					selector: row => row[key],
					sortable: true,
				};
			});

		// Dynamic columns: keys that are not in filterKeys.
		// For keys matching a month format, filter them by start/end dates.
		const monthRegex = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-\d{2,4}$/i;
		const dynamicColumns = allKeys
			.filter(key => !filterKeys.includes(key))
			.filter(key => {
				if (monthRegex.test(key)) {
		if (startDate && endDate) {
						const keyDate = convertKeyToDate(key);
						return keyDate && keyDate >= startDate && keyDate <= endDate;
					}
					return true;
				}
				// For non-month dynamic columns, always include them.
				return true;
			})
			.map(key => {
				// For month columns, add the CTA to open the payment detail modal
				if (monthRegex.test(key)) {
					// Helper function to extract the numeric amount from the cell value.
					const extractAmount = (val) => {
						if (val === null || val === undefined) return null;
						const str = String(val).trim();
						// Use regex to capture the number at the beginning
						const match = str.match(/^(\d+(\.\d+)?)/);
						return match ? parseFloat(match[1]) : null;
					};
					return {
				name: translateMonthColumn(key),
				selector: row => row[key],
				sortable: true,
						// Custom sort function for month columns
						sortFunction: (rowA, rowB) => {
							const a = extractAmount(rowA[key]);
							const b = extractAmount(rowB[key]);
		
							// Handle null values: always push nulls to the end
							if (a === null && b === null) return 0;
							if (a === null) return 1;
							if (b === null) return -1;
		
		
							return a - b;
						},
				cell: row => {
					const rawValue = row[key];
					const str = String(rawValue).trim();
					let style = { padding: '5px', borderRadius: '4px', textAlign: 'center' };
					let amount = str;
					let flag = null;
					let payment_id = null;
					if (str.includes(" ")) {
						// Split values like "1500.00 0 4"
						const parts = str.split(" ");
								amount = parts[0]; // amount is the first part
								flag = parts[1]; // payment status is the second part
								payment_id = parts[2]; // payment_id is the third part
					} else if (str.length > 1) {
								// Otherwise, assume the last character is the flag
						flag = str.slice(-1);
						amount = str.slice(0, -1);
					}
					if (rawValue === null || rawValue === undefined || amount === '' || amount === '0') {
						style = { ...style, backgroundColor: 'red', color: 'white' };
					}
					if (flag === "0") {
						style = { ...style, backgroundColor: 'yellow', color: 'black' };
					}
					const clickable = Boolean(payment_id);
					return (
						<div
									className={{...clickable ?'btn-primary':''}}
							style={{ ...style, cursor: clickable ? 'pointer' : 'default' }}
							onClick={() => { if (clickable) openPaymentDetailModal(payment_id); }}
						>
									{rawValue != null  ? amount : '---'}
						</div>
					);
				}
					};
				} else {
					// For non-month dynamic columns, use the default settings.
					return {
						name: t(key),
						selector: row => row[key],
						sortable: true,
					};
				}
			});
			setReportColumns([...fixedColumns, ...dynamicColumns]);
	}, [reportData, startDate, endDate, t]);
	
	// ------------------- Filter/Transform the Monthly Report Data ----------------------
	useEffect(() => {
		if (reportData.length === 0) {
			setFilteredMonthlyReport([]);
			return;
		}
		let augmentedRows = reportData;
		// If a full date range is provided, ensure every month in the range exists in each row.
		if (startDate && endDate) {
			// Generate the complete month range from start to end.
			const monthRange = generateMonthRange(startDate, endDate);
			augmentedRows = reportData.map(row => {
				const newRow = { ...row };
				monthRange.forEach(monthKey => {
					if (!(monthKey in newRow)) {
						newRow[monthKey] = "0"; // Default value for missing months
					}
				});
				return newRow;
			});
		}
		
		// If needed, apply the "debt" filter.
		let filtered = augmentedRows;
		if (showDebtOnly) {
			const dynamicKeys = (startDate && endDate)
				? generateMonthRange(startDate, endDate)
				: Object.keys(augmentedRows[0]).filter(key => /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/i.test(key));
			filtered = augmentedRows.filter(row =>
				// Adjust the condition as necessary; here we include rows where at least one month equals 0 or empty.
				dynamicKeys.some(key => {
					const value = row[key];
					const numeric = String(value).trim().split(" ")[0];
					return numeric === "" || numeric === "0";
				})
			);
		}
		setFilteredMonthlyReport(filtered);
	}, [filteredMonthlyReport , showDebtOnly, startDate, endDate]);

	// ------------------- Payment Detail Modal Function ----------------------
	const openPaymentDetailModal = (paymentId) => {
		const token = localStorage.getItem('token');
		axios.get(`http://localhost:8080/api/reports/paymentdetails?payment_id=${paymentId}&lang=${i18n.language}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
		.then(response => {
			const paymentDetail = Array.isArray(response.data) ? response.data[0] : response.data;
			setSelectedPaymentDetail(paymentDetail);
			togglePaymentDetailModal();
		})
		.catch(err => {
			console.error('Error fetching payment details:', err);
			swal("Error", t("failed_to_fetch_data"), "error");
		});
	};

	// ------------------- CSV Data Preparation ----------------------
	// Prepare CSV export data and headers
	const csvHeaders = reportData.length > 0 
		? Object.keys(reportData[0]).map(key => ({ label: t(key), key }))
		: [];
	const csvDataReport = filteredMonthlyReport.map(row => {
		const newRow = { ...row };
		const monthRegex = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-\d{2,4}$/i;
		Object.keys(newRow).forEach(key => {
			if (monthRegex.test(key)) {
				if (newRow[key] !== null && newRow[key] !== undefined) {
					const str = String(newRow[key]).trim();
					const parts = str.split(" ");
					newRow[key] = parts[0];
				}
			}
		});
		return newRow;
	});

	const paymentsColumns = [
		{
			name: t('payment_id'),
			selector: row => row.payment_id,
			sortable: true,
			width: '120px'  // Set the student name column width here
		},
		{
			name: t('pt_name'),
			selector: row => row.pt_name,
			sortable: true,
		},
		{
			name: t('payment_month'),
			selector: row => row.payment_month,
			sortable: true,
			cell: row => formatDateMonth(row.payment_month),
		},
		{
			name: t('amount'),
			selector: row => row.amount,
			sortable: true,
		},
		{
			name: t('pay_created_at'),
			selector: row => row.pay_created_at,
			sortable: true,
			cell: row => formatDateTime(row.pay_created_at),
			width: '250px'  // Set the student name column width here
		},
		{
			name: t('payment_status_name'),
			selector: row => row.payment_status_name,
			sortable: true,
		},
		{
			name: t('actions'),
			cell: row => (
				<MDBBtn flat="true" size="sm" onClick={() => {
					setSelectedPayment(row);
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

	const conditionalRowStyles = [
		{
			when: row => row.validated === false, // adjust condition based on your data type
			style: {
				backgroundColor: 'rgba(255, 0, 0, 0.1)', // a light red background
			},
		},
	];

	// ----------------- Fetch StudentsBalance Recharges -----------------
	// Fetch balance recharges once the student details are loaded.
	useEffect(() => {
		if (student) {
			const token = localStorage.getItem('token');
			axios
				.get(`http://localhost:8080/api/reports/studentsbalancerecharges?user_id=${student.user_id}&lang=${i18n.language}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then(response => {
					setStudentsBalanceRecharges(response.data);
					setStudentsBalanceLoading(false);
				})
				.catch(err => {
					console.error("Error fetching balance recharges:", err);
					setStudentsBalanceLoading(false);
				});
		}
	}, [student, i18n.language, t]);
		
	// ----------------- Define StudentsBalance Recharges Columns -----------------
	const studentsbalanceColumns = [
		{
			name: t('balance_recharge_id'),
			selector: row => row.balance_recharge_id,
			sortable: true,
			cell: row => row.balance_recharge_id,
			width: '120px'  // Set the student name column width here
		},
		{
			name: t('pay_created_at'),
			selector: row => row.date,
			sortable: true,
			cell: row => formatDateTime(row.date),
		},
		{
			name: t('amount'),
			selector: row => row.amount,
			sortable: true,
			cell: row => `$${row.amount}`,
		},
		{
			name: t('responsable_full_name'),
			selector: row => row.responsable_full_name,
			sortable: true,
		},
	];

	// Optionally prepare CSV export headers/data for balance recharges:
	const balanceCsvHeaders = balanceRecharges.length > 0 
		? Object.keys(balanceRecharges[0]).map(key => ({ label: t(key), key }))
		: [];
	const balanceCsvData = balanceRecharges;

	// ------------------- Rendering ----------------------
	// Show a spinner only for the student details if still loading.
	if (studentLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<MDBContainer className="my-5 text-center">
					<MDBSpinner grow color="primary" />
				</MDBContainer>
			</div>
		);
	}

	if (error) {
		return (
		<MDBContainer className="my-5">
			<p className="text-danger">{error}</p>
		</MDBContainer>
		);
	}

	if (!student) {
		return (
		<MDBContainer className="my-5 text-center">
			<p>{t("no_student_found")}</p>
		</MDBContainer>
		);
	}

	return (
		<Layout pageTitle={t("student_details")}>
		<MDBContainer>
			{/* User status row */}
			{(!student.user_enabled || !student.group_enabled) && (
				<MDBRow className="mb-3">
					<MDBCol md="12">
						<MDBCard className="shadow-sm">
							<MDBCardBody
								className="d-flex justify-content-between align-items-center"
								style={{
									backgroundColor: "#fff3cd", // light yellow background
									border: "1px solid #ffeeba",
									borderRadius: "6px",
									padding: "1rem",
								}}
							>
								<div className="text-warning">
									<strong>{t('warning')}:</strong> {t("this_account_is_not_enabled")}
								</div>
								<MDBIcon fas icon="exclamation-triangle" size="2x" className="text-warning" />
							</MDBCardBody>
						</MDBCard>
					</MDBCol>
				</MDBRow>
			)}
			
			{/* Quick Access Section */}
			<MDBRow>
				<MDBCol md="12">
					<MDBCard className="mb-3 shadow-sm">
						<MDBCardBody>
							<MDBRow className="g-3">
								<MDBCol md="6" sm="6">
									<MDBBtn color="primary" block>
										<MDBIcon fas icon="money-check-alt" className="me-2" />
										Register Payment
									</MDBBtn>
								</MDBCol>
								<MDBCol md="6" sm="6">
									<MDBBtn color="secondary" block>
										<MDBIcon fas icon="money-check-alt" className="me-2" />
										Add balance
									</MDBBtn>
								</MDBCol>
							</MDBRow>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>

			<MDBRow>
				<MDBCol md="12">
					<MDBCard className="mb-3 shadow-sm">
						<MDBCardHeader className="d-flex justify-content-between align-items-center position-relative">
							<MDBCol className="d-flex align-items-center">
								<MDBIcon fas icon="user" className="me-2" />
								<h4 className="mb-0">{student.student_id+" - "+student.full_name}</h4> 
							</MDBCol>
							<p
								className="p"
								style={
									Number(student.balance) < 0
										? { padding: '5px', margin:'0px', textAlign: 'center', borderRadius: '4px', backgroundColor: 'red', color: 'white' }
										: {padding: '5px', margin:'0px', textAlign: 'center'}
								}
							>
								<strong>{t("balance")}:</strong> {student.balance}
							</p>
						</MDBCardHeader>
						<MDBCardBody>
							<div style={groupStyle}>
								<MDBRow>
										
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("payment_reference")}:</p>
											<strong>{student.payment_reference || "N/A"}</strong>
										</div>
									</MDBCol>
										
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("tuition")}:</p>
											<strong>{student.tuition || "N/A"}</strong>
										</div>
									</MDBCol>
								</MDBRow>
							</div>
							<div style={groupStyle}>
								<MDBRow>
										
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("school")}:</p>
											<strong>{student.commercial_name || "N/A"}</strong>
										</div>
									</MDBCol>
										
										<MDBCol md="6">
											<div className="mb-2">
												<p className='mb-0'>{t("default_tuition")}:</p>
												<strong>{student.default_tuition || "N/A"}</strong>
											</div>
										</MDBCol>

								</MDBRow>
							</div>
							<div style={groupStyle}>
								<MDBRow>
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("generation")}:</p>
											<strong>{student.generation || "N/A"}</strong>
										</div>
									</MDBCol>
									
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("grade_group")}:</p>
											<strong>{student.grade_group || "N/A"}</strong>
										</div>
									</MDBCol>
									
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("scholar_level_name")}:</p>
											<strong>{student.scholar_level_name || "N/A"}</strong>
										</div>
									</MDBCol>

									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("joining_date")}:</p>
											<strong>{student.joining_date || "N/A"}</strong>
										</div>
									</MDBCol>
								</MDBRow>
							</div>
							<div style={groupStyle}>
								<MDBRow>
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("email")}:</p>
											<strong>{student.email || "N/A"}</strong>
										</div>
									</MDBCol>
									
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("username")}:</p>
											<strong>{student.username || "N/A"}</strong>
										</div>
									</MDBCol>
										
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("phone_number")}:</p>
											<strong>{student.phone_number || "N/A"}</strong>
										</div>
									</MDBCol>
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("address")}:</p>
											<strong>{student.address || "N/A"}</strong>
										</div>
									</MDBCol>
								</MDBRow>
										
								<MDBRow>
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("user_status")}:</p>
											<strong>{student.user_status || "N/A"}</strong>
										</div>
									</MDBCol>
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("group_status")}:</p>
											<strong>{student.group_status || "N/A"}</strong>
										</div>
									</MDBCol>
								</MDBRow>
							</div>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>

			{/* -------------- Monthly Payments Report Card -------------- */}
			<MDBRow>
				<MDBCol md="12">
					<MDBCard className="mb-3 shadow-sm">
						<MDBCardHeader>
							<MDBRow className="d-flex justify-content-between align-items-center">
								<MDBCol className="col-auto">
									<h4>{t('monthly_payments_report')}</h4>
								</MDBCol>
								<MDBCol className="col-auto d-flex">
									{/* Only the CSV export is included */}
									<CSVLink 
										data={csvDataReport} 
										headers={csvHeaders} 
										filename="monthly_payments_report.csv"
										style={{ textDecoration: 'none', color: 'inherit' }}
									>
										<MDBBtn color='light' rippleColor='dark'>
											<MDBIcon fas icon="download" className="me-1" />
											{t('export')}
										</MDBBtn>
									</CSVLink>
								</MDBCol>
							</MDBRow>
						</MDBCardHeader>
						<MDBCardBody>
							{/* Filter Controls */}
							<MDBRow className="d-flex justify-content-between">
								<MDBCol md="4">
									<MDBRow className="d-flex align-items-center">
										<MDBCol md="6">
											<MDBInput 
												label={t('start_date')}
												type="month"
												value={startDate}
												onChange={(e) => setStartDate(e.target.value)}
											/>
										</MDBCol>
										<MDBCol md="6">
											<MDBInput 
												label={t('end_date')}
												type="month"
												value={endDate}
												onChange={(e) => setEndDate(e.target.value)}
											/>
										</MDBCol>
									</MDBRow>
								</MDBCol>
								<MDBCol md="4" className='d-flex flex-row-reverse'>
									{/* <MDBBtn 
										color={showDebtOnly ? "warning" : "secondary"}
										onClick={() => setShowDebtOnly(prev => !prev)}
									>
										<MDBIcon fas icon="exclamation-circle" className="me-1" />
										{showDebtOnly ? t('showing_debt_only') : t('show_debt_only')}
									</MDBBtn> */}
								</MDBCol>
							</MDBRow>
							<DataTable
								columns={reportColumns}
								data={filteredMonthlyReport}
								progressPending={monthlyLoading}
								pagination
								highlightOnHover
								responsive
								persistTableHead
								striped
								paginationComponentOptions={paginationOptions}
								noDataComponent={<NoDataComponent message={t('no_data_available')} body={t('no_data_available_body')} />}
							/>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>

			{/* -------------- Payments Report Card -------------- */}
			<MDBRow>
				<MDBCol md="12">
					<MDBCard className="mb-3 shadow-sm">
						<MDBCardHeader>
							<MDBRow className="d-flex justify-content-between align-items-center">
								<MDBCol className="col-auto">
									<h4>{t('payments_list')}</h4>
								</MDBCol>
								<MDBCol className="col-auto d-flex">
									{/* Export button */}
									<CSVLink 
										data={csvData} 
										filename={student.full_name+" "+t('payments')+".csv"}
										style={{ textDecoration: 'none', color: 'inherit' }}
									>
										<MDBBtn color='light' rippleColor='dark'>
												<MDBIcon fas icon="download" className="me-1" />
												{t('export')}
										</MDBBtn>
									</CSVLink>
								</MDBCol>
							</MDBRow>
						</MDBCardHeader>
						<MDBCardBody>
							<DataTable
								// title={t('list')}
								columns={paymentsColumns}
								data={payments}
								progressPending={paymentsLoading}
								pagination
								highlightOnHover
								responsive
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

			{/* StudentsBalance Recharges Table */}
			<MDBRow className="mb-4">
				<MDBCol md="12">
					<MDBCard className="mb-3 shadow-sm">
						<MDBCardHeader>
							<MDBRow className="d-flex justify-content-between align-items-center">
								<MDBCol className="col-auto">
									<h4>{t('balance_recharges')}</h4>
								</MDBCol>
								<MDBCol className="col-auto d-flex">
									<CSVLink 
										data={balanceCsvData} 
										headers={balanceCsvHeaders} 
										filename={student.full_name+" "+t('balance_recharges')+".csv"}
										style={{ textDecoration: 'none', color: 'inherit' }}
									>
										<MDBBtn color="light" rippleColor="dark">
											<MDBIcon fas icon="download" className="me-1" />
											{t('export')}
										</MDBBtn>
									</CSVLink>
								</MDBCol>
							</MDBRow>
						</MDBCardHeader>
						<MDBCardBody>
							<DataTable
								columns={studentsbalanceColumns}
								data={balanceRecharges}
								progressPending={balanceLoading}
								pagination
								highlightOnHover
								responsive
								persistTableHead
								striped
								paginationComponentOptions={paginationOptions}
								noDataComponent={<NoDataComponent message={t('no_data_available')} body={t('no_data_available_body')} />}
							/>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>

		</MDBContainer>

		{/* PayDetail PayDetail Modal (XL size) */}
		<DetailsModal
				open={isPaymentDetailModalOpen}
				onClose={togglePaymentDetailModal}
				formGroups={paymentDetailFormGroups}
				data={selectedPaymentDetail}
				setData={setSelectedPaymentDetail}
				title={t('pay_detail')}
				size="xl"
			/>
		</Layout>
	);
};

export default StudentDetail;
