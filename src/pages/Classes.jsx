import React from 'react'

import Layout                    from '../components/Layout'
import { useTranslation }        from 'react-i18next'


export default function Classes() {
  const { t, i18n } = useTranslation();


  return (
    <Layout pageTitle={t('clasess')}>

    </Layout>
  )
}