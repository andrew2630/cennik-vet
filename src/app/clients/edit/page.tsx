'use client';

import { Suspense } from 'react';
import PageWrapper from '@/components/PageWrapper';
import ClientEditContent from '@/components/pages/ClientEditContent';

export default function EditClientPage() {
  return (
    <PageWrapper>
      <Suspense>
        <ClientEditContent />
      </Suspense>
    </PageWrapper>
  );
}
