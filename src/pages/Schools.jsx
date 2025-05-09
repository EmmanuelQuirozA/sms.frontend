import React from 'react'

import Layout                    from '../components/Layout'
import { useTranslation }        from 'react-i18next'


export default function Schools() {
  const { t, i18n } = useTranslation();


  return (
    <Layout pageTitle={t('schools')}>

    </Layout>
  )
}