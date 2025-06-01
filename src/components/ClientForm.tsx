'use client';

import { useEffect, useState } from 'react';
import { saveClient, updateClient } from '@/utils/clientStorage';
import { Client } from '@/types';

export default function ClientForm({
  onSave,
  editingClient,
}: {
  onSave: () => void;
  editingClient?: Client;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setAddress(editingClient.address || '');
      setPhone(editingClient.phone || '');
    }
  }, [editingClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingClient) {
      updateClient({ ...editingClient, name, address, phone });
    } else {
      saveClient({ name, address, phone });
    }

    setName('');
    setAddress('');
    setPhone('');
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <input
        type="text"
        placeholder="Imię lub nazwa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Adres"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="tel"
        placeholder="Telefon"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        {editingClient ? 'Zapisz zmiany' : 'Dodaj klienta'}
      </button>
    </form>
  );
}
