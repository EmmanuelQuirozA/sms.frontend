// src/components/reports/PaymentsReportPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../Layout';
import { 
  MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardHeader, MDBCardBody, 
  MDBSpinner, MDBInput, MDBBtn, MDBIcon 
} from 'mdb-react-ui-kit';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { CSVLink } from 'react-csv';
import FiltersSidebar from '../common/FiltersSidebar';
import swal from 'sweetalert';
import DetailsModal from '../common/DetailsModal';
import NoDataComponent from '../../components/NoDataComponent';

const PaymentsReportPage = () => {
  const { t, i18n } = useTranslation();
  
  // Data and loading states for the report
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [reportColumns, setReportColumns] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Optional student id state. (If needed, you can include an input to update this value.)
  const [studentId, setStudentId] = useState('');

  // ------------------- StudentsBalance recharges States ----------------------
  const [balanceRecharges, setStudentsBalanceRecharges] = useState([]);
  const [balanceLoading, setStudentsBalanceLoading] = useState(true);
  
  // Modal states for payment detail modal
  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);

  // Modal states for student detail modal
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Filter states for date and debt-only
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDebtOnly, setShowDebtOnly] = useState(false);

  // New state: for dynamic school options
  const [schoolOptions, setSchoolOptions] = useState([]);
  
  // Sidebar filter state and visibility
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    school_id: '', 
    g_enabled: '',
    u_enabled: '',
    student: '', 
    payment_reference: '', 
    generation: '', 
    class: '', 
    scholar_level: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    school_id: '', 
    g_enabled: '',
    u_enabled: '',
    student: '', 
    payment_reference: '', 
    generation: '', 
    class: '', 
    scholar_level: '',
  });
  
  // State to temporarily hold the balance filters while the user types.
  const [tempBalanceFilters, setTempBalanceFilters] = useState({
    student_full_name: '',
    date: '', // Expecting a YYYY-MM-DD format from a date input.
    grade_group: '',
    responsable_full_name: '' // Note: using the same key name as your column.
  });

  // State to store the applied balance filters.
  const [appliedBalanceFilters, setAppliedBalanceFilters] = useState({
    student_full_name: '',
    date: '',
    grade_group: '',
    responsable_full_name: ''
  });

  // State to hold the filtered balance recharges data.
  const [filteredBalanceData, setFilteredBalanceData] = useState([]);
  const [isBalanceFilterVisible, setIsBalanceFilterVisible] = useState(false);
  const toggleBalanceFilterVisibility = () => setIsBalanceFilterVisible(prev => !prev);

  // Toggle modal functions
  const toggleStudentDetailModal = () => setIsStudentDetailModalOpen(prev => !prev);
  const togglePaymentDetailModal = () => setIsPaymentDetailModalOpen(prev => !prev);
  const toggleFilterVisibility = () => setIsFilterVisible(prev => !prev);

  useEffect(() => {
    if (!balanceRecharges || balanceRecharges.length === 0) {
      setFilteredBalanceData([]);
      return;
    }
  
    let filtered = balanceRecharges;
  
    // Loop through each key in the applied balance filters.
    Object.keys(appliedBalanceFilters).forEach(key => {
      const filterValue = appliedBalanceFilters[key];
      if (filterValue !== '') {
        // For the date filter, assume the incoming date from the API is an ISO string (or similar).
        if (key === 'date') {
          filtered = filtered.filter(item =>
            item.date && item.date.slice(0, 10) === filterValue
          );
        } else {
          filtered = filtered.filter(item =>
            item[key]?.toString().toLowerCase().includes(filterValue.toLowerCase())
          );
        }
      }
    });
  
    setFilteredBalanceData(filtered);
  }, [balanceRecharges, appliedBalanceFilters]);

  const balanceFiltersArray = [
    {
      id: "student_full_name",
      label: t("student_full_name"),
      value: tempBalanceFilters.student_full_name,
      type: "text",
      onChange: (value) => setTempBalanceFilters(prev => ({ ...prev, student_full_name: value }))
    },
    {
      id: "date",
      label: t("payment_date"),
      value: tempBalanceFilters.date,
      type: "date", // HTML5 date input.
      onChange: (value) => setTempBalanceFilters(prev => ({ ...prev, date: value }))
    },
    {
      id: "grade_group",
      label: t("grade_group"),
      value: tempBalanceFilters.grade_group,
      type: "text",
      onChange: (value) => setTempBalanceFilters(prev => ({ ...prev, grade_group: value }))
    },
    {
      id: "responsable_full_name",
      label: t("responsable_full_name"), // Ensure this matches your column key.
      value: tempBalanceFilters.responsable_full_name,
      type: "text",
      onChange: (value) => setTempBalanceFilters(prev => ({ ...prev, responsable_full_name: value }))
    },
  ];

  const handleApplyBalanceFilters = () => {
    setAppliedBalanceFilters(tempBalanceFilters);
    toggleBalanceFilterVisibility();
  };
  
  const handleClearBalanceFilters = () => {
    const emptyFilters = {
      student_full_name: '',
      date: '',
      grade_group: '',
      responsable_full_name: ''
    };
    setTempBalanceFilters(emptyFilters);
    setAppliedBalanceFilters(emptyFilters);
    setFilteredBalanceData(balanceRecharges); // Reset to show full data.
    toggleBalanceFilterVisibility();
  };

  // ----------------- Load Schools Options When Sidebar Opens -----------------
  useEffect(() => {
    if (isFilterVisible && schoolOptions.length === 0) {
      const token = localStorage.getItem('token');
      axios.get(`http://localhost:8080/api/schools/list?lang=es&status_filter=-1`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        // Map the response data to options with label and value
        const options = response.data.map(school => ({
          label: school.description,
          value: school.school_id
        }));
        setSchoolOptions(options);
      })
      .catch(err => console.error("Error loading schools:", err));
    }
  }, [isFilterVisible, schoolOptions.length]);
  
  // Function to open student details modal
  const openStudentDetailsModal = (studentId) => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8080/api/students/list?student_id=${studentId}&lang=${i18n.language}&status_filter=-1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      // If the response is an array, take the first object.
      const studentDetail = Array.isArray(response.data) ? response.data[0] : response.data;
      setSelectedStudentDetail(studentDetail);
      toggleStudentDetailModal();
    })
    .catch(err => {
      console.error('Error fetching student details:', err);
      swal(t("error"), t("failed_to_fetch_data"), "error");
    });
  };

  // Pagination options with translations
	const paginationOptions = {
		rowsPerPageText: t('rows_per_page'),
		rangeSeparatorText: t('of'),
		selectAllRowsItem: true,
		selectAllRowsItemText: t('all'),
	};

  // Dummy onSave handler for the details modal
  const handlePaymentDetailSave = (data) => {
    // Handle any saving logic if needed.
    togglePaymentDetailModal();
  };

  // ----------------- Prepare Filters Array for Sidebar -----------------
  const filtersArray = [
    {
      id: "school_id",
      label: t("school"),
      value: tempFilters.school_id,
      type: "select",
      options: schoolOptions,
      onChange: (value) => setTempFilters((prev) => ({ ...prev, school_id: value }))
    },
    {
      id: "group_status",
      label: t("group_status"),
      value: tempFilters.g_enabled,
      type: "select",
      options: [
        { label: t("select_option"), value: "" },
        { label: t("enabled"), value: 'true' },
        { label: t("disabled"), value: 'false' }
      ],
      onChange: (value) => setTempFilters((prev) => ({ ...prev, g_enabled: value }))
    },
    {
      id: "user_status",
      label: t("user_status"),
      value: tempFilters.u_enabled,
      type: "select",
      options: [
        { label: t("select_option"), value: "" },
        { label: t("enabled"), value: 'true' },
        { label: t("disabled"), value: 'false' }
      ],
      onChange: (value) => setTempFilters((prev) => ({ ...prev, u_enabled: value }))
    },
    // Add additional filters if needed
    {
      id: "student",
      label: t("student"),
      value: tempFilters.student,
      onChange: (value) => setTempFilters((prev) => ({ ...prev, student: value })),
      type: "text"
    },
    {
      id: "payment_reference",
      label: t("payment_reference"),
      value: tempFilters.payment_reference,
      onChange: (value) => setTempFilters((prev) => ({ ...prev, payment_reference: value })),
      type: "text"
    },
    // ... add any other existing filters here.
  ];

  // studentDetailFormGroups used by the FormModal
	const studentDetailFormGroups = [
		{
			groupTitle: '', // translation key for group title
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
				{ key: 'commercial_name', label: 'commercial_name', type: 'text' },
			],
		},
		{
			groupTitle: 'contact_and_address',
			columns: 3,
			fields: [
				{ key: 'address', label: 'address', type: 'text' },
				{ key: 'phone_number', label: 'phone_number', type: 'tel' },
				{ key: 'personal_email', label: 'personal_email', type: 'email' },
			],
		},
		{
			groupTitle: 'user_and_group_status',
			columns: 2,
			fields: [
				{ key: 'user_status', label: 'user_status', type: 'text' },
				{ key: 'group_status', label: 'group_status', type: 'tel' },
			],
		}
	];

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

  // Fixed keys for filtering (for both filtering and sorting)
  // "school_id" is kept here for filtering but will not be visible in the table
  const filterKeys = ['school_id', 'u_enabled', 'g_enabled', 'student', 'payment_reference', 'generation', 'class', 'scholar_level'];
  // Visible fixed keys for the table: exclude "school_id"
  const visibleFixedKeys = filterKeys.filter(key => key !== 'school_id' && key !== 'u_enabled' && key !== 'g_enabled');

  // Helper mapping for converting month abbreviations to month numbers
  const monthMapping = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
  };

  // Helper function to translate a month column header, e.g., "Jan-25"
  const translateMonthColumn = (key) => {
    const parts = key.split('-');
    if (parts.length === 2) {
      const monthAbbrev = parts[0].toLowerCase();
      let year = parts[1];
      // Convert two-digit years to four-digit format if necessary
      if (year.length === 2) {
        year = "20" + year;
      }
      // Use your translation keys like "month.jan", "month.feb", etc.
      return `${t(`month.${monthAbbrev}`)}-${year}`;
    }
    return t(key);
  };

  // Convert a key like "Jan-25" or "jan-2025" to "2025-01"
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

  // Function to open the payment detail modal for a given payment_id.
  const openPaymentDetailModal = (paymentId) => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8080/api/reports/paymentdetails?payment_id=${paymentId}&lang=${i18n.language}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      // If the response is an array, take the first object.
      const paymentDetail = Array.isArray(response.data) ? response.data[0] : response.data;
      setSelectedPaymentDetail(paymentDetail);
      togglePaymentDetailModal();
    })
    .catch(err => {
      console.error('Error fetching payment details:', err);
      swal("Error", t("failed_to_fetch_data"), "error");
    });
  };

  //////////////////////////////////////////////////////////////////////////////
  // FETCH REPORT DATA (updated to include optional student_id, start_date, and end_date)
  //////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    setTableLoading(true);
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
    //   const [year, month] = endDate.split('-');
    //   const lastDay = new Date(year, month, 0).getDate(); // new Date(year, month, 0) gives the last day of that month
    //   const formattedLastDay = lastDay < 10 ? `0${lastDay}` : lastDay;
    //   url += `&end_date=${endDate}-${formattedLastDay}`;
    // }

    axios
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setReportData(response.data);
        setTableLoading(false);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching report:', err);
        setError(t('failed_to_fetch_data'));
        setTableLoading(false);
        setLoading(false);
      });
  }, [i18n.language, t, studentId, startDate, endDate]);
  //////////////////////////////////////////////////////////////////////////////

  // Build the table columns whenever reportData or the date filters change
  useEffect(() => {
    if (reportData.length === 0) return;
    const allKeys = Object.keys(reportData[0]);
    // Fixed columns: use only visible keys
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
              let studentIdValue = null;
              if (row.student && row.student.includes('-')) {
                const parts = row.student.split('-');
                studentIdValue = parts[0];
                displayName = parts.slice(1).join('-');
              }
              return (
                <span
                  className='p-1 btn-primary'
                  style={{ cursor: 'pointer', backgroundColor:'#3b71ca', color:'white', borderRadius:'6px' }}
                  onClick={() => openStudentDetailsModal(studentIdValue)}
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
            // Use a selector that returns the raw value for sorting
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
              // If the value contains spaces (e.g., "1500.00 0 4"), split by space.
              if (str.includes(" ")) {
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
              } else if (flag !== "3") {
                style = { ...style, backgroundColor: 'yellow', color: 'black' };
              }
              // If a payment_id exists, add a pointer cursor and a click handler
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

  // Filter rows whenever reportData, date filters, or showDebtOnly changes
  useEffect(() => {
    if (reportData.length === 0) return;
    let filtered = reportData;

    // Apply date filters and debt-only filter (if any)
    const allKeys = Object.keys(reportData[0]);
    const monthRegex = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-\d{2,4}$/i;
    // Determine the dynamic keys based on current date filter (only month columns)
    const dynamicKeys = allKeys.filter(key => !filterKeys.includes(key))
      .filter(key => {
        if (monthRegex.test(key)) {
          if (startDate && endDate) {
            const keyDate = convertKeyToDate(key);
            return keyDate && keyDate >= startDate && keyDate <= endDate;
          }
          return true;
        }
        return true;
      });
    if (showDebtOnly) {
      filtered = filtered.filter(row =>
        dynamicKeys.some(key => {
          const value = row[key];
          if (value === null || value === undefined) return true;
          const str = String(value).trim();
          // Extract the amount part (if there's a flag, remove it)
          let amount = '';
          if (str.includes(" ")) {
            amount = str.split(" ")[0];
          } else if (str.length > 1) {
            amount = str.slice(0, -1);
          }
          return amount === '' || amount === '0';
        })
      );
    }

    // Apply sidebar (tempFilters) filters
    Object.keys(appliedFilters).forEach(key => {
      if (appliedFilters[key] && appliedFilters[key].trim() !== '') {
        filtered = filtered.filter(item =>
          item[key]?.toString().toLowerCase().includes(appliedFilters[key].toLowerCase())
        );
      }
    });
    setFilteredData(filtered);
  }, [reportData, showDebtOnly, startDate, endDate, appliedFilters]);

  // Prepare CSV export data and headers
  const csvHeaders = reportData.length > 0 
    ? Object.keys(reportData[0]).map(key => ({ label: t(key), key }))
    : [];
  const csvData = filteredData.map(row => {
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

  // Handlers for the filter sidebar buttons
  const handleApplyFilters = () => {
    // Build filtered data from reportData using the current tempFilters.
    // (You may need to adjust the filtering logic based on your data structure.)
    let filtered = reportData;

    // Filter by school_id if provided.
    if (tempFilters.school_id) {
      filtered = filtered.filter(item => String(item.school_id) === tempFilters.school_id);
    }
    // Filter by group_status if provided.
    if (tempFilters.g_enabled) {
      filtered = filtered.filter(item => String(item.g_enabled) === tempFilters.g_enabled);
    }
    // Filter by user_status if provided.
    if (tempFilters.u_enabled) {
      filtered = filtered.filter(item => String(item.u_enabled) === tempFilters.u_enabled);
    }
    // Filter by student name.
    if (tempFilters.student) {
      filtered = filtered.filter(item =>
        item.student && item.student.toLowerCase().includes(tempFilters.student.toLowerCase())
      );
    }
    // Filter by payment_reference.
    if (tempFilters.payment_reference) {
      filtered = filtered.filter(item =>
        item.payment_reference && item.payment_reference.toLowerCase().includes(tempFilters.payment_reference.toLowerCase())
      );
    }
    // Add additional filters here as needed.

    setFilteredData(filtered);
    toggleFilterVisibility();
  };
  // Clear filters handler
  const handleClearFilters = () => {
    const emptyFilters = {
      school_id: '', 
      g_enabled: '',
      u_enabled: '',
      student: '', 
      payment_reference: '', 
      generation: '', 
      class: '', 
      scholar_level: '',
    };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setFilteredData(reportData); // Reset to full data
    toggleFilterVisibility();
  };

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

  // ----------------- Fetch StudentsBalance Recharges -----------------
	// Fetch balance recharges once the student details are loaded.
	useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`http://localhost:8080/api/reports/studentsbalancerecharges?lang=${i18n.language}`, {
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
	}, [i18n.language, t]);
		
	// ----------------- Define StudentsBalance Recharges Columns -----------------
	const balanceColumns = [
		{
			name: t('balance_recharge_id'),
			selector: row => row.balance_recharge_id,
			sortable: true,
			cell: row => row.balance_recharge_id,
			width: '120px'  // Set the student name column width here
		},
		{
			name: t('full_name'),
			selector: row => row.student_full_name,
			sortable: true,
			cell: row => {
        return (
          <span
            className='p-1 btn-primary'
            style={{ cursor: 'pointer', backgroundColor:'#3b71ca', color:'white', borderRadius:'6px' }}
            onClick={() => openStudentDetailsModal(row.student_id)}
          >
            {row.student_full_name}
          </span>
        );
      },
      width: '275px'  // Set the student name column width here,
		},
		{
			name: t('generation'),
			selector: row => row.generation,
			sortable: true,
			cell: row => row.generation,
		},
		{
			name: t('grade_group'),
			selector: row => row.grade_group,
			sortable: true,
			cell: row => row.grade_group,
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

  if (loading) {
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

  return (
    <Layout pageTitle={t('payments_reports')}>
      <MDBRow className='mb-2'>
        <MDBCol>
          <MDBCard>
            <MDBCardHeader>
              <MDBRow className="d-flex justify-content-between align-items-center">
                <MDBCol className="col-auto">
                  <h4>{t('monthly_payments_report')}</h4>
                </MDBCol>
                <MDBCol className="col-auto d-flex">
                  {/* Additional controls can be added here */}
                  {/* Export button */}
                  <CSVLink 
                    data={csvData} 
                    headers={csvHeaders} 
                    filename="payments_report.csv"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <MDBBtn color='light' rippleColor='dark'>
                        <MDBIcon fas icon="download" className="me-1" />
                        {t('export')}
                    </MDBBtn>
                  </CSVLink>
                  {/* Filter button */}
                  <MDBBtn color='light' rippleColor='dark'  onClick={toggleFilterVisibility}>
                    <MDBIcon fas icon="filter" className="me-1" />
                    {t('filter')} {Object.values(tempFilters).filter(val => val && val.trim() !== '').length > 0 
                      ? `(${Object.values(tempFilters).filter(val => val && val.trim() !== '').length})` 
                      : ''}
                  </MDBBtn>
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
                        onChange={(e) => {
                          console.log("New startDate:", e.target.value);
                          setStartDate(e.target.value);
                        }}
                      />
                    </MDBCol>
                    <MDBCol md="6">
                      <MDBInput 
                        label={t('end_date')}
                        type="month"
                        value={endDate}
                        onChange={(e) => {
                          console.log("New endDate:", e.target.value);
                          setEndDate(e.target.value);
                        }}
                      />
                    </MDBCol>
                  </MDBRow>
                </MDBCol>
                <MDBCol md="4" className='d-flex flex-row-reverse'>
                  <MDBBtn 
                    color={showDebtOnly ? "warning" : "secondary"}
                    onClick={() => setShowDebtOnly(prev => !prev)}
                  >
                    <MDBIcon fas icon="exclamation-circle" className="me-1" />
                    {showDebtOnly ? t('showing_debt_only') : t('show_debt_only')}
                  </MDBBtn>
                </MDBCol>
              </MDBRow>
              <DataTable
                columns={reportColumns}
                data={filteredData}
                progressPending={tableLoading}
                pagination
                highlightOnHover
                responsive
                striped
                persistTableHead
                noDataComponent={<NoDataComponent message={t('no_data_available')} body={t('no_data_available_body')} />}
                paginationComponentOptions={paginationOptions}
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
                  {/* Additional controls can be added here */}
                  {/* Export button */}
									<CSVLink 
										data={balanceCsvData} 
										headers={balanceCsvHeaders} 
										filename={t('balance_recharges')+".csv"}
										style={{ textDecoration: 'none', color: 'inherit' }}
									>
										<MDBBtn color="light" rippleColor="dark">
											<MDBIcon fas icon="download" className="me-1" />
											{t('export')}
										</MDBBtn>
									</CSVLink>
                  {/* Filter button */}
                  <MDBBtn color='light' rippleColor='dark' onClick={toggleBalanceFilterVisibility}>
                    <MDBIcon fas icon="filter" className="me-1" />
                    {t('filter')}
                    {Object.values(tempBalanceFilters).filter(val => val && val.trim() !== '').length > 0 
                      ? ` (${Object.values(tempBalanceFilters).filter(val => val && val.trim() !== '').length})`
                      : ''}
                  </MDBBtn>
								</MDBCol>
							</MDBRow>
						</MDBCardHeader>
						<MDBCardBody>
              <DataTable
                columns={balanceColumns}
                data={filteredBalanceData}  // Use the filtered data here.
                progressPending={balanceLoading}
                pagination
                highlightOnHover
                responsive
                striped
                persistTableHead
                noDataComponent={
                  <NoDataComponent message={t('no_data_available')} body={t('no_data_available_body')} />
                }
              />
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>

      {/* StudentDetail StudentDetail Modal (XL size) */}
      <DetailsModal
        open={isStudentDetailModalOpen}
        onClose={toggleStudentDetailModal}
        formGroups={studentDetailFormGroups}
        data={selectedStudentDetail}
        setData={setSelectedStudentDetail}
        title={t('student')}
        size="xl"
        details={true}
      />

      {/* PaymentDetail PaymentDetail Modal (XL size) */}
      <DetailsModal
        open={isPaymentDetailModalOpen}
        onClose={togglePaymentDetailModal}
        formGroups={paymentDetailFormGroups}
        data={selectedPaymentDetail}
        setData={setSelectedPaymentDetail}
        title={t('pay_detail')}
        size="xl"
      />

      {/* Filter Sidebar */}
      <FiltersSidebar 
        filters={filtersArray}
        applyFilters={handleApplyFilters}
        clearFilters={handleClearFilters}
        isVisible={isFilterVisible}
        toggleVisibility={toggleFilterVisibility}
      />
      
      <FiltersSidebar 
        filters={balanceFiltersArray}
        applyFilters={handleApplyBalanceFilters}
        clearFilters={handleClearBalanceFilters}
        isVisible={isBalanceFilterVisible}
        toggleVisibility={toggleBalanceFilterVisibility}
      />
    </Layout>
  );
};

export default PaymentsReportPage;
