'use client';

import { useEffect, useState } from 'react';
import { getClients, deleteClient } from '@/utils/clientStorage';
import { Client } from '@/types';

export default function ClientList({
  refresh,
  onEdit,
}: {
  refresh: number;
  onEdit: (client: Client) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(getClients());
  }, [refresh]);

  const handleDelete = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć klienta?')) {
      deleteClient(id);
      setClients(getClients());
    }
  };

  return (
    <div>
      <h2 className="font-semibold mb-2">Lista klientów:</h2>
      {clients.length === 0 && <p>Brak klientów.</p>}
      <ul className="space-y-2">
        {clients.map((client) => (
          <li key={client.id} className="border p-2 rounded">
            <div className="flex justify-between items-center">
              <div>
                <strong>{client.name}</strong><br />
                {client.address && <span>📍 {client.address}</span>}<br />
                {client.phone && <span>📞 {client.phone}</span>}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => onEdit(client)}
                  className="text-blue-600 underline"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="text-red-600 underline"
                >
                  Usuń
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
