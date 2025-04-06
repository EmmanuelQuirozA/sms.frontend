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
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states for payment detail modal
  const [isPayDetailModalOpen, setIsPayDetailModalOpen] = useState(false);
  const [selectedPayDetail, setSelectedPayDetail] = useState(null);

  // Modal states for student detail modal
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Filter states for date and debt-only
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDebtOnly, setShowDebtOnly] = useState(false);

  // Sidebar filter state and visibility
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    school_id: '', 
    student: '', 
    payment_reference: '', 
    generation: '', 
    class: '', 
    scholar_level: '',
  });

  // Toggle modal functions
  const toggleStudentDetailModal = () => setIsStudentDetailModalOpen(prev => !prev);
  const togglePayDetailModal = () => setIsPayDetailModalOpen(prev => !prev);
  const toggleFilterVisibility = () => setIsFilterVisible(prev => !prev);

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

  // Dummy onSave handler for the details modal
  const handlePayDetailSave = (data) => {
    // Handle any saving logic if needed.
    togglePayDetailModal();
  };


  // studentDetailFormGroups used by the FormModal
	const studentDetailFormGroups = [
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
		}
	];

  // payDetailFormGroups used by the FormModal
	const payDetailFormGroups = [
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
			groupTitle: 'payment_detals',
			columns: 3,
			fields: [
				{ key: 'payment_month', label: 'payment_month', type: 'date' },
				{ key: 'amount', label: 'amount', type: 'number' },
				{ key: 'payment_status_name', label: 'payment_status_name', type: 'text' },
				{ key: 'validator_full_name', label: 'validator_full_name', type: 'text' },
				{ key: 'validator_phone_number', label: 'validator_phone_number', type: 'number' },
				{ key: 'validated_at', label: 'validated_at', type: 'datetime' },
			],
		}
	];

  // Fixed keys for filtering (for both filtering and sorting)
  // "school_id" is kept here for filtering but will not be visible in the table
  const filterKeys = ['school_id', 'student', 'payment_reference', 'generation', 'class', 'scholar_level'];
  // Visible fixed keys for the table: exclude "school_id"
  const visibleFixedKeys = filterKeys.filter(key => key !== 'school_id');

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
  const openPayDetailModal = (paymentId) => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:8080/api/reports/paydetails?payment_id=${paymentId}&lang=${i18n.language}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      // If the response is an array, take the first object.
      const paymentDetail = Array.isArray(response.data) ? response.data[0] : response.data;
      setSelectedPayDetail(paymentDetail);
      togglePayDetailModal();
    })
    .catch(err => {
      console.error('Error fetching payment details:', err);
      swal("Error", t("failed_to_fetch_data"), "error");
    });
  };

  // Fetch report data from backend
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios
      .get(`http://localhost:8080/api/reports/payments/report?lang=${i18n.language}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        const data = response.data;
        setReportData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching report:', err);
        setError(t('failed_to_fetch_data'));
        setLoading(false);
      });
  }, [i18n.language, t]);

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
              let studentId = null;
              if (row.student && row.student.includes('-')) {
                const parts = row.student.split('-');
                studentId = parts[0];
                displayName = parts.slice(1).join('-');
              }
              return (
                <span
                  className='p-1 btn-primary'
                  style={{ cursor: 'pointer', backgroundColor:'#3b71ca', color:'white', borderRadius:'6px' }}
                  onClick={() => openStudentDetailsModal(studentId)}
                >
                  {displayName}
                </span>
              );
            }
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
              }
              if (flag === "0") {
                style = { ...style, backgroundColor: 'yellow', color: 'black' };
              }
              // If a payment_id exists, add a pointer cursor and a click handler
              const clickable = Boolean(payment_id);
              return (
                <div
                  className={{...clickable ?'btn-primary':''}}
                  style={{ ...style, cursor: clickable ? 'pointer' : 'default' }}
                  onClick={() => { if (clickable) openPayDetailModal(payment_id); }}
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
    setColumns([...fixedColumns, ...dynamicColumns]);
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
    Object.keys(tempFilters).forEach(key => {
      if (tempFilters[key] && tempFilters[key].trim() !== '') {
        filtered = filtered.filter(item =>
          item[key]?.toString().toLowerCase().includes(tempFilters[key].toLowerCase())
        );
      }
    });
    setFilteredData(filtered);
  }, [reportData, showDebtOnly, startDate, endDate, tempFilters]);

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
    toggleFilterVisibility();
    // The useEffect will update filteredData based on tempFilters
  };

  const handleClearFilters = () => {
    setTempFilters({
      school_id: '', 
      student: '', 
      payment_reference: '', 
      generation: '', 
      class: '', 
      scholar_level: '',
    });
    toggleFilterVisibility();
  };

  if (loading) {
    return (
      <MDBContainer className="my-5 text-center">
        <MDBSpinner grow color="primary" />
      </MDBContainer>
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
      <MDBRow>
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
                columns={columns}
                data={filteredData}
                pagination
                highlightOnHover
                responsive
                striped
                persistTableHead
                noDataComponent={<NoDataComponent message={t('no_data_available')} body={t('no_data_available_body')} />}
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
      />

      {/* PayDetail PayDetail Modal (XL size) */}
      <DetailsModal
        open={isPayDetailModalOpen}
        onClose={togglePayDetailModal}
        formGroups={payDetailFormGroups}
        data={selectedPayDetail}
        setData={setSelectedPayDetail}
        title={t('pay_detail')}
        size="xl"
      />

      {/* Filter Sidebar */}
      <FiltersSidebar
        filters={Object.keys(tempFilters).map(key => ({
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

export default PaymentsReportPage;
