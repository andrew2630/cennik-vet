'use client';

import { useSearchParams } from 'next/navigation';
import InvoiceView from '@/components/InvoiceView';

export default function InvoiceInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return <p className="text-red-600">Nieprawidłowe ID faktury.</p>;
  }

  return <InvoiceView id={id} />;
}