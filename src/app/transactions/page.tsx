'use client';

import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import { useState } from 'react';
import { Transaction } from '@/types';

export default function TransactionsPage() {
  const [editingTx, setEditingTx] = useState<Transaction | undefined>(undefined);
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="max-w-3xl mx-auto">
      {editingTx ? (
        <>
          <h1 className="text-xl font-bold mb-2">
            {editingTx.id ? 'Edycja faktury' : 'Nowa faktura'}
          </h1>
          <TransactionForm
            editingTransaction={editingTx}
            onSaved={() => {
              setEditingTx(undefined);
              setRefresh((r) => r + 1);
            }}
            onCancel={() => setEditingTx(undefined)}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Lista faktur</h1>
            <button
              onClick={() =>
                setEditingTx({
                  id: '',
                  clientId: '',
                  date: new Date().toISOString(),
                  items: [],
                  distanceKm: 0,
                  isNight: false,
                  isWeekend: false,
                  manualAdjustment: 0,
                  totalPrice: 0,
                })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Dodaj nową
            </button>
          </div>
          <TransactionList onEdit={(tx) => setEditingTx(tx)} key={refresh} />
        </>
      )}
    </div>
  );
}
