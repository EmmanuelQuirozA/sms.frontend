import { useState, useEffect, useCallback } from 'react';
import { getPaymentRequestDetails } from '../api/studentApi';
import { useTranslation } from 'react-i18next';

export default function usePaymentRequestDetails(payment_request_id) {
  const { i18n, t } = useTranslation();
  const [paymentRequest, setPaymentRequest]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const loadDetails = useCallback(() => {
    setLoading(true);
    getPaymentRequestDetails(payment_request_id, i18n.language)
      .then(data => {
        setPaymentRequest(data);
        setLoading(false);
      })
      .catch(() => {
        setError(t('failed_to_fetch_data'));
        setLoading(false);
      });
  }, [payment_request_id, i18n.language, t]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  return { paymentRequest, loading, error, reload: loadDetails  };
}
