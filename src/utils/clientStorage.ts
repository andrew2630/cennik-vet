import { Client } from '@/types';

const STORAGE_KEY = 'vet_clients';

export function getClients(): Client[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveClient(client: Client) {
  const all = getClients();
  const index = all.findIndex(p => p.id === client.id);
  const updated = index !== -1 ? [...all.slice(0, index), client, ...all.slice(index + 1)] : [...all, client];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteClient(id: string): void {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}
