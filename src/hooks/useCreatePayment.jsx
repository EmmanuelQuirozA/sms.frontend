// src/hooks/useCreatePayment.js
import { useState } from 'react';
import { createPayment } from '../api/studentApi';
import { useTranslation }   from 'react-i18next';
import swal from 'sweetalert';

export default function useSubmitPayment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { i18n, t } = useTranslation();

  const submitPayment = async (payload, onSuccess) => {
    setIsSubmitting(true);

    try {
      const resData = await createPayment(payload, i18n.language);

      swal(resData.title, resData.message, resData.type);

      if (resData.success) {
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      swal('Error', 'Unexpected error occurred while submitting payment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitPayment, isSubmitting };
}
