'use client';

import { Suspense } from 'react';
import PageWrapper from '@/components/PageWrapper';
import TravelReportPageContent from '@/components/pages/TravelReportPageContent';

export default function TravelReportPage() {
  return (
    <PageWrapper>
      <Suspense>
        <TravelReportPageContent />
      </Suspense>
    </PageWrapper>
  );
}
