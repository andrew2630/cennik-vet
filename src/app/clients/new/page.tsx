'use client';

import { Suspense } from 'react';
import PageWrapper from '@/components/PageWrapper';
import ClientNewContent from '@/components/pages/ClientNewContent';

export default function NewClientPage() {
  return (
    <PageWrapper>
      <Suspense>
        <ClientNewContent />
      </Suspense>
    </PageWrapper>
  );
}
