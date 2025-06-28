import React from 'react';
import usePaymentRequestDetails from '../../hooks/usePaymentRequestDetails';
import Header from './Header';
import InfoCard from './InfoCard';
import PaymentsTable from './PaymentsTable';
import LogsList from './LogsList';
import CreatePaymentModal from './modals/CreatePaymentModal';
import EditPaymentModal   from './modals/EditPaymentModal';

export default function PaymentRequestDetails({ id }) {
  const { data, loading, error } = usePaymentRequestDetails(id);
  const [showCreate, setShowCreate] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  if (loading) return <p>Loading…</p>;
  if (error)   return <p>Error: {error.message}</p>;

  return (
    <>
      <Header
        request={data.request}
        onCreate={() => setShowCreate(true)}
      />
      <InfoCard info={data.request} />
      <PaymentsTable
        payments={data.payments}
        onEdit={p => setEditing(p)}
      />
      <LogsList logs={data.logs} />

      {showCreate && (
        <CreatePaymentModal
          requestId={id}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editing && (
        <EditPaymentModal
          payment={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
