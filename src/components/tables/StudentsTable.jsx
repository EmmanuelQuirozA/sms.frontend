
import React, { useState, useEffect } from 'react'
import { useTranslation }        from 'react-i18next'
import useStudent         from '../../hooks/useStudent'
import DataTableWrapper          from './DataTableWrapper'
import FiltersSidebar            from '../common/FiltersSidebar'
import DetailsModal                   from '../modals/DetailsModal'
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBIcon } from 'mdb-react-ui-kit'
import { pick } from 'lodash'

export default function StudentsTable({ 
  student_id, 
  canExport,
  canSeeHeaderActions = true 
}) {
  const { t, i18n } = useTranslation();
  
  // ── Your uncontrolled inputs ─────────────────────────────────────
  const defaultFilters = {
    student_id:'',
    full_name:'',
    payment_reference:'',
    generation:'',
    grade_group:'',
    status_filter:'',
  };
  const [filters, setFilters]               = useState(defaultFilters);

  // ── The filters you’ve actually “applied” ─────────────────────────
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  
  // ── Where your filtered rows live ─────────────────────────────────
  const [filteredData, setFilteredData]         = useState([]);

  // ── Fetch report via our hook ───────────────────────────────────
  const {
    data,
    columns,
    loading,
    error,

    totalRows,
    page,
    perPage,
    handlePageChange,
    handlePerRowsChange,
    exportAll,

    // sorting
    handleSort

  } = useStudent(
    student_id,
    appliedFilters.full_name,
    appliedFilters.payment_reference,
    appliedFilters.generation,
    appliedFilters.grade_group,
    appliedFilters.status_filter
  );
  
  // ── Pure “apply these filters to these rows” helper ──────────────
  const applyPureFilters = (rows, f) => {
    let out = rows;
    const {
      full_name,
      payment_reference,
      generation,
      grade_group,
      status_filter
    } = f;

    if (full_name) out = out.filter(r => String(r.full_name) === full_name);
    if (payment_reference) out = out.filter(r => String(r.payment_reference) === payment_reference);
    if (generation) out = out.filter(r => String(r.generation) === generation);
    if (grade_group) out = out.filter(r => String(r.grade_group) === grade_group);
    if (status_filter) out = out.filter(r => r.status_filter?.toLowerCase().includes(status_filter.toLowerCase()));
    return out;
  };
  
  // ── Re‐filter whenever the raw data or the *applied* filters change ─
  useEffect(() => {
    setFilteredData(applyPureFilters(data, appliedFilters));
  }, [data, appliedFilters]);

  // ── “Apply” button handler: copy current inputs into appliedFilters ─
  const applyFilters = () => {
    setAppliedFilters(filters);
    handlePageChange(1)
    setFilterVisible(false);
  };

  // ── “Clear” button handler: reset both input & applied filters ─────
  const clearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    handlePageChange(1)
    setFilterVisible(false);
  };

  // ── Sidebar toggle & header Actions ──────────────────────────────
  const [filterVisible, setFilterVisible] = useState(false)
  const headerActions = (
    <>
      { canSeeHeaderActions && (
      <MDBBtn size="sm" outline onClick={()=>setFilterVisible(v=>!v)}>
        <MDBIcon fas icon="filter" className="me-1"/> {t('filter')}
      </MDBBtn>)}
    </>
  )

  const exportKeys = [
    'student_id',
    'full_name',
    'payment_reference',
    'generation',
    'grade_group',
    'status_filter'
  ]
  // ── CSV prep (strip flags just like your page did) ───────────────
  const csvHeaders = exportKeys.map(key => ({
    key,
    label: t(key)
  }))

  const csvData = filteredData.map(row =>
    pick(row, exportKeys)
  )
  
  // Your form-group definitions for DetailsModal
  const studentDetailFormGroups = [
    {
      groupTitle: '',
      columns:    2,
      fields: [
        { key: 'full_name',         label: 'full_name',         type: 'text' },
        { key: 'payment_reference', label: 'payment_reference', type: 'text' },
      ],
    },
    {
      groupTitle: 'student_details',
      columns:    4,
      fields: [
        { key: 'generation',         label: 'generation',         type: 'text' },
        { key: 'class',        label: 'class',        type: 'text' },
        { key: 'scholar_level', label: 'scholar_level', type: 'text' },
        { key: 'commercial_name',    label: 'commercial_name',    type: 'text' },
      ],
    },
    {
      groupTitle: 'contact_and_address',
      columns:    3,
      fields: [
        { key: 'address',        label: 'address',        type: 'text'  },
        { key: 'phone_number',   label: 'phone_number',   type: 'tel'   },
        { key: 'personal_email', label: 'personal_email', type: 'email' },
      ],
    },
    {
      groupTitle: 'user_and_group_status',
      columns:    2,
      fields: [
        { key: 'user_status',  label: 'user_status',  type: 'text' },
        { key: 'group_status', label: 'group_status', type: 'text' },
      ],
    },
  ];
  
  return (
    <>
      <DataTableWrapper
        title={t('students')}
        columns={columns}
        data={data}
        loading={loading}

        // server-side
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}

        // ** server‐side sorting **
        sortServer
        onSort={handleSort}

        // export all
        canExport={canExport}
        csvFilename={t('students')+".csv"}
        onExportAll={exportAll}
        csvHeaders={csvHeaders}
        csvData={csvData}

        // Header Extras
        headerActions={headerActions}
      />

      {/* Payments Filters Sidebar */}
      <FiltersSidebar
        filters={[
          { id: 'payment_id', label: t('payment_id'), type: 'text', value: filters.payment_id,
            onChange: v => setFilters(f => ({ ...f, payment_id: v })) },
          { id: 'payment_request_id', label: t('payment_request_id'), type: 'text', value: filters.payment_request_id,
            onChange: v => setFilters(f => ({ ...f, payment_request_id: v })) },
          { id: 'student_full_name', label: t('full_name'), type: 'text', value: filters.student_full_name,
            onChange: v => setFilters(f => ({ ...f, student_full_name: v })) },
          { id: 'payment_reference', label: t('payment_reference'), type: 'text', value: filters.payment_reference,
            onChange: v => setFilters(f => ({ ...f, payment_reference: v })) },
          { id: 'generation', label: t('generation'), type: 'text', value: filters.generation,
            onChange: v => setFilters(f => ({ ...f, generation: v })) },
          { id: 'grade_group', label: t('class'), type: 'text', value: filters.grade_group,
            onChange: v => setFilters(f => ({ ...f, grade_group: v })) },
          { id: 'pt_name', label: t('pt_name'), type: 'text', value: filters.pt_name,
            onChange: v => setFilters(f => ({ ...f, pt_name: v })) },
          { id: 'scholar_level_name', label: t('scholar_level_name'), type: 'text', value: filters.scholar_level_name,
            onChange: v => setFilters(f => ({ ...f, scholar_level_name: v })) },
          { id: 'payment_month', label: t('payment_month'), type: 'month', value: filters.payment_month,
            onChange: v => setFilters(f => ({ ...f, payment_month: v })) },
          { id: 'payment_created_at', label: t('payment_created_at'), type: 'date', value: filters.payment_created_at,
            onChange: v => setFilters(f => ({ ...f, payment_created_at: v })) }
        ]}
        setFilters={setFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        isVisible={filterVisible}
        toggleVisibility={()=>setFilterVisible(v=>!v)}
      />

            
      {/* Student Detail Modals */}
    </>
  );
}