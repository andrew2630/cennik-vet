'use client';

import { Suspense } from 'react';
import PageWrapper from '@/components/PageWrapper';
import ProductNewContent from '@/components/pages/ProductNewContent';

export default function NewProductPage() {
  return (
    <PageWrapper>
      <Suspense>
        <ProductNewContent />
      </Suspense>
    </PageWrapper>
  );
}
