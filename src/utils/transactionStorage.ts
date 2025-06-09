import { Transaction } from '@/types';
import { queueOperation } from './syncSupabase';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'vet_transactions';

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveTransaction(tx: Transaction): Transaction {
  const all = getTransactions();

  const transactionToSave: Transaction = {
    ...tx,
    id: tx.id || uuid(),
    date: tx.date || new Date().toISOString(),
  };

  const index = all.findIndex((t) => t.id === transactionToSave.id);
  if (index !== -1) {
    all[index] = transactionToSave;
  } else {
    all.push(transactionToSave);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  queueOperation({ type: 'upsert', table: 'transactions', data: transactionToSave });
  return transactionToSave;
}

export function updateTransaction(tx: Transaction): Transaction {
  return saveTransaction(tx);
}

export function deleteTransaction(id: string): void {
  const filtered = getTransactions().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  queueOperation({ type: 'delete', table: 'transactions', id });
}
