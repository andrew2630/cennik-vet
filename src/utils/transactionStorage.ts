import { Transaction } from '@/types'
import { queueOperation } from './syncSupabase'
import { notifyDataUpdated } from './dataUpdateEvent'
import { v4 as uuid } from 'uuid';
import { storageKey } from './userStorage'

const BASE_KEY = 'vet_transactions'
const STORAGE_KEY = () => storageKey(BASE_KEY)

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY());
  const parsed: Transaction[] = stored ? JSON.parse(stored) : [];
  return parsed.map(tx => ({ ...tx, paymentMethod: tx.paymentMethod ?? 'cash' }));
}

export function saveTransaction(tx: Transaction): Transaction {
  const all = getTransactions();

  const transactionToSave: Transaction = {
    ...tx,
    paymentMethod: tx.paymentMethod ?? 'cash',
    id: tx.id || uuid(),
    date: tx.date || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const index = all.findIndex((t) => t.id === transactionToSave.id);
  if (index !== -1) {
    all[index] = transactionToSave;
  } else {
    all.push(transactionToSave);
  }

  localStorage.setItem(STORAGE_KEY(), JSON.stringify(all))
  notifyDataUpdated();
  if (transactionToSave.clientId) {
    queueOperation({
      type: 'upsert',
      table: 'transactions',
      data: transactionToSave,
    })
  }
  return transactionToSave;
}

export function updateTransaction(tx: Transaction): Transaction {
  return saveTransaction(tx);
}

export function deleteTransaction(id: string): void {
  const filtered = getTransactions().filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEY(), JSON.stringify(filtered))
  notifyDataUpdated();
  queueOperation({ type: 'delete', table: 'transactions', id });
}
