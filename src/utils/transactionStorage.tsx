import { Transaction } from '@/types';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'vet_transactions';

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveTransaction(tx: Transaction): Transaction {
  const all = getTransactions();

  const existingIndex = all.findIndex((t) => t.id === tx.id);
  const transactionToSave: Transaction = {
    ...tx,
    id: tx.id || uuid(),
    date: tx.date || new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    all[existingIndex] = transactionToSave;
  } else {
    all.push(transactionToSave);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return transactionToSave;
}

export function updateTransaction(updated: Transaction): void {
  const all = getTransactions().map((t) => (t.id === updated.id ? updated : t));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteTransaction(id: string): void {
  const filtered = getTransactions().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
