'use client';

import { Suspense } from 'react';
import TransactionViewContent from '@/components/pages/TransactionViewContent';
import PageWrapper from '@/components/PageWrapper';

export default function ViewTransactionPage() {
  return (
    <PageWrapper>
      <Suspense>
        <TransactionViewContent />
      </Suspense>
    </PageWrapper>
  );
}
