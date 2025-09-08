'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import PageWrapper from '@/components/PageWrapper';
import TravelReportPageContent from '@/components/pages/TravelReportPageContent';

export default function TravelReportPage() {
  const t = useTranslations('travelReport');

  return (
    <PageWrapper>
      <Suspense fallback={<div>{t('loading')}</div>}>
        <TravelReportPageContent />
      </Suspense>
    </PageWrapper>
  );
}
