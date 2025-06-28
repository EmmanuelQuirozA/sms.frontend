// src/components/tables/PaymentFormGroups.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation }              from 'react-i18next'
import useBalanceRecharges             from '../../hooks/useBalanceRecharges'
import DataTableWrapper                from './DataTableWrapper'
import FiltersSidebar                  from '../common/FiltersSidebar'
import { MDBBtn, MDBIcon }             from 'mdb-react-ui-kit'

export default function PaymentFormGroups({ fullList, userId, canExport }) {
  const { t } = useTranslation()
  const { data, columns, loading, error } = useBalanceRecharges({ userId, fullList })

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

  // Update user form fields to pass to the modal component
	const updatePaymentFormGroups = [
		{
			groupTitle: 'user_info',
			columns: 4,
			fields: [
				{ key: 'payment_concept_id', label: 'payment_concept_id', type: 'text', required: true },
				{ key: 'payment_month', label: 'payment_month', type: 'text', required: true },
				{ key: 'amount', label: 'amount', type: 'number', required: true },
				{ key: 'payment_status_id', label: 'payment_status_id', type: 'text', required: true },
				{ key: 'validated_by_user_id', label: 'validated_by_user_id', type: 'text', required: true },
				{ key: 'validated_at', label: 'validated_at', type: 'text', required: true },
				{ key: 'created_at', label: 'created_at', type: 'text', required: true },
				{ key: 'comments', label: 'comments', type: 'text', required: true },
				{ key: 'payment_request_id', label: 'payment_request', type: 'text', required: true },
				{ key: 'payment_through_id', label: 'payment_through', type: 'text', required: true },
			]
		},
	];
}