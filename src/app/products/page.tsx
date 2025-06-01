'use client';

import { useState } from 'react';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';

export default function ProductsPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Produkty i cennik</h1>
      <ProductForm onAdd={() => setRefresh((r) => r + 1)} />
      <ProductList refresh={refresh} />
    </div>
  );
}
