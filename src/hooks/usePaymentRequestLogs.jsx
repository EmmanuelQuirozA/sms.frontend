// usePaymentRequestLogs.js
import { useState, useEffect, useCallback } from 'react';
import { getPaymentRequestLogs } from '../api/studentApi';
import { useTranslation } from 'react-i18next';

export default function usePaymentRequestLogs(payment_request_id) {
  const { i18n, t } = useTranslation();
  const [logs, setLogs]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    getPaymentRequestLogs(payment_request_id, i18n.language)
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => {
        setError(t('failed_to_fetch_data'));
        setLoading(false);
      });
  }, [payment_request_id, i18n.language, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { logs, loading, error, reload: loadData  };
}
