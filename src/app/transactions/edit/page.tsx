'use client';

import { Suspense } from 'react';
import PageWrapper from '@/components/PageWrapper';
import TransactionEditContent from '@/components/pages/TransactionEditContent';

export default function EditTransactionPage() {
  return (
    <PageWrapper>
      <Suspense>
        <TransactionEditContent />
      </Suspense>
    </PageWrapper>
  );
}
