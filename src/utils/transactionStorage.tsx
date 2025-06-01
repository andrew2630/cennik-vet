import { Transaction } from '@/types';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'vet_transactions';

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveTransaction(data: Omit<Transaction, 'id' | 'date'>): Transaction {
  const newTx: Transaction = {
    ...data,
    id: uuid(),
    date: new Date().toISOString(),
  };
  const all = getTransactions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...all, newTx]));
  return newTx;
}

export function updateTransaction(updated: Transaction) {
  const all = getTransactions().map((t) => (t.id === updated.id ? updated : t));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteTransaction(id: string) {
  const filtered = getTransactions().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
