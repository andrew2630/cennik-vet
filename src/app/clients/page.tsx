'use client';

import { useState } from 'react';
import ClientForm from '@/components/ClientForm';
import ClientList from '@/components/ClientList';
import { Client } from '@/types';

export default function ClientsPage() {
  const [refresh, setRefresh] = useState(0);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Klienci</h1>
      <ClientForm
        onSave={() => {
          setRefresh((r) => r + 1);
          setEditingClient(undefined);
        }}
        editingClient={editingClient}
      />
      <ClientList
        refresh={refresh}
        onEdit={(client) => setEditingClient(client)}
      />
    </div>
  );
}
