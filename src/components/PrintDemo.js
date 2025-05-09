// src/components/PrintDemo.js
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const PrintableContent = React.forwardRef((props, ref) => (
  <div ref={ref} style={{ padding: '20px', border: '1px solid #ccc' }}>
    <h1>Invoice #12345</h1>
    <p>This content will be printed.</p>
  </div>
));

export default function PrintDemo() {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'TestPrintInvoice',
  });

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={handlePrint}>Print Now</button>
      <PrintableContent ref={printRef} />
    </div>
  );
}
