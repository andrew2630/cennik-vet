'use client';

import { useEffect, useState } from 'react';
import { getTransactions, deleteTransaction } from '@/utils/transactionStorage';
import { getClients } from '@/utils/clientStorage';
import { Transaction, Client } from '@/types';
import Link from 'next/link';

export default function TransactionList({
  onEdit,
}: {
  onEdit?: (tx: Transaction) => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setTransactions(getTransactions().sort((a, b) => b.date.localeCompare(a.date)));
    setClients(getClients());
  }, []);

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || 'Nieznany klient';

  const handleDelete = (id: string) => {
    if (confirm('Usunąć tę fakturę?')) {
      deleteTransaction(id);
      setTransactions(getTransactions());
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Faktury</h1>
      <ul className="space-y-3">
        {transactions.map((tx) => (
          <li key={tx.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">{getClientName(tx.clientId)}</div>
              <div className="text-sm text-gray-600">{new Date(tx.date).toLocaleString('pl-PL')}</div>
            </div>
            <div className="text-right space-x-2">
              <span className="font-semibold">{tx.totalPrice.toFixed(2)} zł</span>
              <Link href={`/invoice/${tx.id}`} className="text-blue-600 underline text-sm">Szczegóły</Link>
              {onEdit && (
                <>
                  <button onClick={() => onEdit(tx)} className="text-blue-600 underline text-sm">Edytuj</button>
                  <button onClick={() => handleDelete(tx.id)} className="text-red-600 underline text-sm">Usuń</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
