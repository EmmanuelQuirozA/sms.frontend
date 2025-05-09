// src/components/tables/BalanceRechargesTable.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation }              from 'react-i18next'
import useBalanceRecharges             from '../../hooks/useBalanceRecharges'
import DataTableWrapper                from './DataTableWrapper'
import FiltersSidebar                  from '../common/FiltersSidebar'
import { MDBBtn, MDBIcon }             from 'mdb-react-ui-kit'

export default function BalanceRechargesTable({ fullList, userId, canExport }) {
  const { t } = useTranslation()
  const { data, columns, loading, error } = useBalanceRecharges({ userId, fullList })

  // --- Local filter state ---
  const [filters, setFilters]           = useState({
    student_full_name: '',
    date:               '',
    grade_group:        '',
    responsable_full_name: ''
  })
  const [filteredData, setFilteredData] = useState([])

  // whenever the hook refetches, reset the local filteredData
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  const applyFilters = () => {
    let rows = data
    Object.entries(filters).forEach(([key, val]) => {
      if (!val) return
      rows = rows.filter(r =>
        String(r[key] || '')
          .toLowerCase()
          .includes(val.toLowerCase())
      )
    })
    setFilteredData(rows)
    setFilterVisible(false)
  }
  const clearFilters = () => {
    setFilters({
      student_full_name: '',
      date:               '',
      grade_group:        '',
      responsable_full_name: ''
    })
    setFilteredData(data)
    setFilterVisible(false)
  }

  // toggle sidebar
  const [filterVisible, setFilterVisible] = useState(false)
  const headerActions = (
    <MDBBtn size="sm" outline onClick={() => setFilterVisible(v => !v)}>
      <MDBIcon fas icon="filter" className="me-1" />
      {t('filter')}
    </MDBBtn>
  )

  // prepare CSV
  const csvHeaders = data.length
    ? Object.keys(data[0]).map(key => ({ label: t(key), key }))
    : []
  const csvData = data

  return (
    <>
      <DataTableWrapper
        title={t('balance_recharges')}
        columns={columns}
        data={filteredData}
        loading={loading}
        canExport={canExport}
        csvFilename="balance_recharges.csv"
        csvHeaders={csvHeaders}
        csvData={csvData}
        headerActions={headerActions}
      />
      <FiltersSidebar
        filters={[
          {
            id:    'student_full_name',
            label: t('full_name'),
            type:  'text',
            value: filters.student_full_name,
            onChange: v =>
              setFilters(f => ({ ...f, student_full_name: v }))
          },
          {
            id:    'date',
            label: t('date'),
            type:  'date',
            value: filters.date,
            onChange: v => setFilters(f => ({ ...f, date: v }))
          },
          {
            id:    'grade_group',
            label: t('grade_group'),
            type:  'text',
            value: filters.grade_group,
            onChange: v => setFilters(f => ({ ...f, grade_group: v }))
          },
          {
            id:    'responsable_full_name',
            label: t('responsable_full_name'),
            type:  'text',
            value: filters.responsable_full_name,
            onChange: v =>
              setFilters(f => ({ ...f, responsable_full_name: v }))
          }
        ]}
        setFilters={setFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        isVisible={filterVisible}
        toggleVisibility={() => setFilterVisible(v => !v)}
      />
    </>
  )
}
