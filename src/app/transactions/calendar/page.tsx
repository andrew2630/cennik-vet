'use client';

import { useEffect, useState } from 'react';
import { getTransactions } from '@/utils/transactionStorage';
import { getClients } from '@/utils/clientStorage';
import { Transaction, Client } from '@/types';
import Link from 'next/link';

export default function CalendarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setTransactions(getTransactions());
    setClients(getClients());
  }, []);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentYear, currentMonth, i + 1);
    const iso = formatDate(date);
    const hasTx = transactions.some((t) => t.date.startsWith(iso));
    return { day: i + 1, iso, hasTx };
  });

  const filteredTx = selectedDate
    ? transactions.filter((t) => t.date.startsWith(selectedDate))
    : [];

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || 'Nieznany klient';

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kalendarz faktur</h1>
      <div className="grid grid-cols-7 gap-2 text-center mb-6">
        {days.map((d) => (
          <button
            key={d.iso}
            className={`p-2 rounded border ${
              d.hasTx ? 'bg-green-200 font-bold' : 'bg-gray-100'
            } ${selectedDate === d.iso ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedDate(d.iso)}
          >
            {d.day}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Faktury z dnia: {new Date(selectedDate).toLocaleDateString('pl-PL')}
          </h2>
          {filteredTx.length === 0 && <p>Brak faktur.</p>}
          <ul>
            {filteredTx.map((tx) => (
              <li key={tx.id} className="border p-2 rounded flex justify-between">
                <span>{getClientName(tx.clientId)}</span>
                <span>{tx.totalPrice.toFixed(2)} zł</span>
                <Link href={`/invoice/${tx.id}`} className="text-blue-600 underline text-sm">Szczegóły</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
