'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/utils/productStorage';
import { Product } from '@/types';

export default function ProductList({ refresh }: { refresh: number }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, [refresh]);

  return (
    <div>
      <h2 className="font-semibold mb-2">Lista produktów:</h2>
      {products.length === 0 && <p>Brak produktów.</p>}
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="border p-2 rounded">
            <strong>{p.name}</strong> – {p.pricePerUnit} zł / {p.unit}
          </li>
        ))}
      </ul>
    </div>
  );
}
