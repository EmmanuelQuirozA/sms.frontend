import React from 'react'

import Layout                    from '../components/Layout'
import { useTranslation }        from 'react-i18next'
import StudentsTable from '../components/tables/StudentsTable';
import useAuth from '../hooks/useAuth';


export default function Students() {
  const { t, i18n } = useTranslation();
  const { role } = useAuth || {};
  const canExport = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canSeeHeaderActions=true;
  const canSeeDebtOnlyBtn=true;


  return (
    <Layout pageTitle={t('students')}>
      <StudentsTable
        canExport={canExport}
        canSeeHeaderActions={canSeeHeaderActions}
        canSeeDebtOnlyBtn={canSeeDebtOnlyBtn}
      />

    </Layout>
  )
}