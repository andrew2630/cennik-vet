import { Client } from '@/types';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'vet_clients';

export function getClients(): Client[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveClient(data: Omit<Client, 'id'>): Client {
  const clients = getClients();
  const newClient: Client = { id: uuid(), ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...clients, newClient]));
  return newClient;
}

export function updateClient(updated: Client) {
  const clients = getClients().map((c) => (c.id === updated.id ? updated : c));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function deleteClient(id: string) {
  const clients = getClients().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}
