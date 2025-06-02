'use client';

import { Suspense } from 'react';
import InvoiceInner from './invoice-inner';

export default function InvoicePage() {
  return (
    <Suspense fallback={<p>Ładowanie faktury...</p>}>
      <InvoiceInner />
    </Suspense>
  );
}
