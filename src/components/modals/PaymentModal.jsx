// src/components/modals/PaymentModal.jsx
import React, { useEffect, useState } from 'react';
import FormModal from './FormModal';
import DetailsModal from './DetailsModal';
import { useTranslation } from 'react-i18next';
// import { getPaymentById } from '../../api/studentApi'; // You need this implemented

const PaymentModal = ({
  open,
  onClose,
  edition = false,
  creation = false,
  readOnly = false,
  payment_id = null,
}) => {
  const { t } = useTranslation();
  const [paymentData, setPaymentData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);


  const paymentDetailFormGroups = [
		{
			groupTitle: 'student', // translation key for group title
			columns: 2,
			fields: [
				{ key: 'student_full_name', label: 'full_name', type: 'text' },
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

  const updatePaymentFormGroups = [
		{
			groupTitle: 'student', // translation key for group title
			columns: 2,
			fields: [
				{ key: 'student_full_name', label: 'full_name', type: 'text' },
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

  // useEffect(() => {
  //   if ((edition || readOnly) && payment_id) {
  //     getPaymentById(payment_id)
  //       .then((data) => setPaymentData(data))
  //       .catch(err => console.error('Error loading payment:', err));
  //   } else if (creation) {
  //     setPaymentData({});
  //   }
  // }, [edition, readOnly, creation, payment_id]);

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      // TODO: Call your API to create a payment
      console.log('Creating payment with', paymentData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      // TODO: Call your API to update a payment
      console.log('Updating payment with', paymentData);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  if (readOnly) {
    return (
      <DetailsModal
        show={open}
        setShow={onClose}
        formGroups={paymentDetailFormGroups}
        data={paymentData}
        title={t('payment')}
        size="xl"
      />
    );
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      formGroups={updatePaymentFormGroups}
      data={paymentData}
      setData={setPaymentData}
      onSave={creation ? handleCreate : handleUpdate}
      title={creation ? t('create_payment') : t('update_payment')}
      size="lg"
      idPrefix={creation ? 'createPayment_' : 'updatePayment_'}
      isSaving={isSaving}
    />
  );
};

export default PaymentModal;
