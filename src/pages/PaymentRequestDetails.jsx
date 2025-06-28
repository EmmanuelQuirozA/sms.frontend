import React from 'react';
import { useParams } from 'react-router-dom';
import PaymentRequestDetails from '../components/PaymentRequestDetails';

export default function PaymentRequestDetailsPage() {
  const { requestId } = useParams();
  return <PaymentRequestDetails id={requestId} />;
}
