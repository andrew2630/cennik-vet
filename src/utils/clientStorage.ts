import { Client } from '@/types';
import { queueOperation } from './syncSupabase';
import { notifyDataUpdated } from './dataUpdateEvent';
import { getTransactions, deleteTransaction } from './transactionStorage';

const STORAGE_KEY = 'vet_clients';

export function getClients(): Client[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveClient(client: Client) {
  const clientToSave = { ...client, updatedAt: new Date().toISOString() };
  const all = getClients();
  const index = all.findIndex(p => p.id === clientToSave.id);
  const updated =
    index !== -1
      ? [...all.slice(0, index), clientToSave, ...all.slice(index + 1)]
      : [...all, clientToSave];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyDataUpdated();
  queueOperation({ type: 'upsert', table: 'clients', data: clientToSave });
}

export function deleteClient(id: string): void {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  notifyDataUpdated();

  const toDelete = getTransactions().filter(t => t.clientId === id);
  toDelete.forEach(t => deleteTransaction(t.id));

  queueOperation({ type: 'delete', table: 'clients', id });
}
