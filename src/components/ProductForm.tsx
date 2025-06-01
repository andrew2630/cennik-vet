'use client';

import { useState } from 'react';
import { saveProduct } from '@/utils/productStorage';

export default function ProductForm({ onAdd }: { onAdd: () => void }) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('szt');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    saveProduct({ name, unit, pricePerUnit: parseFloat(price) });
    setName('');
    setUnit('szt');
    setPrice('');
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <input
        type="text"
        placeholder="Nazwa produktu"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Jednostka (np. szt, ml)"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        step="0.01"
        placeholder="Cena za jednostkę"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Dodaj produkt
      </button>
    </form>
  );
}
