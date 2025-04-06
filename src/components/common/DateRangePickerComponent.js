import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import $ from 'jquery';
import moment from 'moment';
import 'daterangepicker/daterangepicker.css';
import 'daterangepicker';

const DateRangePickerComponent = ({ onDateRangeChange }) => {
  const { t } = useTranslation();
  const dateRangeRef = useRef(null);

  useEffect(() => {
    // Initialize the date range picker on the input element
    $(dateRangeRef.current).daterangepicker(
      {
        locale: {
          format: 'YYYY-MM',
          applyLabel: t('apply'),
          cancelLabel: t('cancel'),
        },
        startDate: moment().startOf('month'),
        endDate: moment().endOf('month'),
        // Optionally, add additional options per your requirements
      },
      (start, end) => {
        // Update the parent component with the selected date range in "YYYY-MM" format
        onDateRangeChange({
          startDate: start.format('YYYY-MM'),
          endDate: end.format('YYYY-MM'),
        });
      }
    );
  }, [onDateRangeChange, t]);

  return (
    <input
      type="text"
      ref={dateRangeRef}
      className="form-control"
      placeholder={t('Select date range')}
    />
  );
};

export default DateRangePickerComponent;
