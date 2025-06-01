'use client';

import { useEffect, useState } from 'react';
import { getClients } from '@/utils/clientStorage';
import { getProducts } from '@/utils/productStorage';
import { getSettings } from '@/utils/settingsStorage';
import { saveTransaction, updateTransaction } from '@/utils/transactionStorage';
import { Client, Product, TransactionItem, Transaction } from '@/types';
import { useRouter } from 'next/navigation';

export default function TransactionForm({
  editingTransaction,
  onSaved,
}: {
  editingTransaction?: Transaction;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [isNight, setIsNight] = useState(false);
  const [isWeekend, setIsWeekend] = useState(false);
  const [adjustment, setAdjustment] = useState(0);
  const [total, setTotal] = useState(0);
  const settings = getSettings();
  const router = useRouter();

  useEffect(() => {
    setClients(getClients());
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    const sum = items.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      return acc + (product ? product.pricePerUnit * item.quantity : 0);
    }, 0);

    const distanceCost = distanceKm * settings.pricePerKm;
    let result = sum + distanceCost;

    if (isNight) result += (result * settings.nightSurcharge) / 100;
    if (isWeekend) result += (result * settings.weekendSurcharge) / 100;

    result += adjustment;
    setTotal(Math.max(0, Math.round(result * 100) / 100)); // zaokrąglenie do 0.01
  }, [
    items,
    distanceKm,
    isNight,
    isWeekend,
    adjustment,
    products,
    settings.pricePerKm,
    settings.nightSurcharge,
    settings.weekendSurcharge,
  ]);

  useEffect(() => {
    if (editingTransaction) {
      setClientId(editingTransaction.clientId);
      setItems(editingTransaction.items);
      setDistanceKm(editingTransaction.distanceKm);
      setIsNight(editingTransaction.isNight);
      setIsWeekend(editingTransaction.isWeekend);
      setAdjustment(editingTransaction.manualAdjustment ?? 0);
    }
  }, [editingTransaction]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const updated = [...items];
    if (field === 'quantity') {
      updated[index].quantity = Number(value);
    } else {
      updated[index].productId = value as string;
    }
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.length === 0) return;

    const tx: Transaction = {
      id: editingTransaction?.id || '',
      clientId,
      items,
      distanceKm,
      isNight,
      isWeekend,
      manualAdjustment: adjustment,
      totalPrice: total,
      date: editingTransaction?.date || new Date().toISOString(),
    };

    if (editingTransaction) {
      updateTransaction(tx);
    } else {
      saveTransaction(tx);
    }

    if (onSaved) onSaved();
    else router.push('/transactions');
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 max-w-xl mx-auto'>
      <h1 className='text-2xl font-bold'>Nowa faktura</h1>

      <select value={clientId} onChange={e => setClientId(e.target.value)} className='w-full border p-2 rounded'>
        <option value=''>-- Wybierz klienta --</option>
        {clients.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div className='space-y-2'>
        {items.map((item, index) => (
          <div key={index} className='flex gap-2'>
            <select
              value={item.productId}
              onChange={e => handleItemChange(index, 'productId', e.target.value)}
              className='flex-1 border p-2 rounded'
            >
              <option value=''>-- Produkt --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pricePerUnit} zł/{p.unit})
                </option>
              ))}
            </select>
            <input
              type='number'
              value={item.quantity}
              onChange={e => handleItemChange(index, 'quantity', e.target.value)}
              className='w-24 border p-2 rounded'
              min={0}
              step='0.1'
            />
          </div>
        ))}
        <button type='button' onClick={handleAddItem} className='text-blue-600 underline'>
          + Dodaj produkt
        </button>
      </div>

      <input
        type='number'
        step='1'
        min='0'
        value={distanceKm}
        onChange={e => setDistanceKm(parseFloat(e.target.value))}
        className='w-full border p-2 rounded'
        placeholder='Dystans w km'
      />

      <div className='flex gap-4 items-center'>
        <label>
          <input type='checkbox' checked={isNight} onChange={e => setIsNight(e.target.checked)} /> Noc
        </label>
        <label>
          <input type='checkbox' checked={isWeekend} onChange={e => setIsWeekend(e.target.checked)} /> Weekend
        </label>
      </div>

      <input
        type='number'
        step='0.01'
        value={adjustment}
        onChange={e => setAdjustment(parseFloat(e.target.value))}
        className='w-full border p-2 rounded'
        placeholder='Rabat / Dopłata (np. -20 lub 30)'
      />

      <div className='text-xl font-semibold'>
        Suma: {total} {settings.currency}
      </div>

      <button type='submit' className='bg-purple-600 text-white px-4 py-2 rounded'>
        Zapisz transakcję
      </button>
    </form>
  );
}
