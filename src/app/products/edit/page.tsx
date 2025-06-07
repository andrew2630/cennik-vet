'use client';

import { Suspense } from 'react';
import PageWrapper from '@/components/PageWrapper';
import ProductEditContent from '@/components/pages/ProductEditContent';

export default function EditProductPage() {
  return (
    <PageWrapper>
      <Suspense>
        <ProductEditContent />
      </Suspense>
    </PageWrapper>
  );
}
