// src/hooks/useBalanceRecharges.js
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getBalanceRecharges } from '../api/studentApi';
import { TextWrap } from 'react-bootstrap-icons';

export default function useBalanceRecharges({ userId, fullList }) {
  const { i18n, t } = useTranslation();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  
  // Helper function to format dates/datetimes
	const formatDateTime = (value) => {
		if (!value) return '';
		const date = new Date(value);
		if (i18n.language === 'es') {
			const formatted = new Intl.DateTimeFormat('es-ES', { 
				day: '2-digit', 
				month: 'long', 
				year: 'numeric', 
				hour: '2-digit', 
				minute: '2-digit' 
			}).format(date);
			return formatted.replace(/ de (\d{4})$/, ' del $1');
		} else {
			return new Intl.DateTimeFormat('en-US', { 
				month: 'long', 
				day: '2-digit', 
				year: 'numeric', 
				hour: '2-digit', 
				minute: '2-digit' 
			}).format(date);
		}
	};

  useEffect(() => {
    setLoading(true);
    getBalanceRecharges(userId, i18n.language)
      .then(fetched => {
        setData(fetched);
        setError('');
      })
      .catch(() => {
        setError(t('failed_to_fetch_data'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, i18n.language, t]);

  // Build columns conditionally based on fullList
  const columns = [];

  // Full list
  if (fullList) {
    columns.push(
      { name: t('balance_recharge_id'), selector: r => r.balance_recharge_id, sortable: true, width: '120px' },
      { name: t('full_name'), selector: r => r.user_full_name, sortable: true, wrap: true, width: '250px' },
      { name: t('role_name'), selector: r => r.role_name, sortable: true },
      { name: t('generation'), selector: r => r.generation, sortable: true },
      { name: t('grade_group'), selector: r => r.grade_group, sortable: true },
      { name: t('pay_created_at'), selector: r => r.date, sortable: true, cell: row => formatDateTime(row.date), width: '200px' },
      { name: t('amount'), selector: r => r.amount, sortable: true, cell: row => `$${row.amount}`, width: '120px' },
      { name: t('responsable_full_name'), selector: r => r.responsable_full_name, sortable: true, wrap: true, width: '250px'}
    );
  } else {
    columns.push(
      { name: t('balance_recharge_id'), selector: r => r.balance_recharge_id, sortable: true },
      { name: t('pay_created_at'), selector: r => r.date, sortable: true, cell: row => formatDateTime(row.date) },
      { name: t('amount'), selector: r => r.amount, sortable: true, cell: row => `$${row.amount}` },
      { name: t('responsable_full_name'), selector: r => r.responsable_full_name, sortable: true, wrap: true }
    );
  }

  return { data, columns, loading, error };
}