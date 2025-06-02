'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClients, deleteClient } from '@/utils/clientStorage';
import { Client } from '@/types';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash } from 'lucide-react';

export default function ClientList({ refresh }: { refresh: number }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'address'>('name'); // domyślnie: name
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setClients(getClients());
  }, [refresh]);

  const handleDelete = (id: string) => {
    deleteClient(id);
    setClients(getClients());
    setSelectedClient(null);
  };

  const filtered = clients
    .filter(client => {
      const q = search.toLowerCase();
      return (
        client.name.toLowerCase().includes(q) ||
        (client.address && client.address.toLowerCase().includes(q)) ||
        (client.phone && client.phone.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const aValue = sortField === 'name' ? a.name.toLowerCase() : (a.address || '').toLowerCase();
      const bValue = sortField === 'name' ? b.name.toLowerCase() : (b.address || '').toLowerCase();
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

  return (
    <Card className='mt-6 bg-transparent'>
      <CardHeader className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex flex-col md:flex-row md:items-center md:gap-4 w-full'>
          <CardTitle>Lista klientów</CardTitle>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'>
          <Input
            className='min-w-[50px] sm:min-w-[80px]'
            placeholder='Szukaj klienta (imię, adres, telefon)...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select value={sortField} onValueChange={(val: 'name' | 'address') => setSortField(val)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Sortuj wg' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='name'>Nazwa</SelectItem>
              <SelectItem value='address'>Adres</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(val: 'asc' | 'desc') => setSortOrder(val)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Kolejność' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Rosnąco</SelectItem>
              <SelectItem value='desc'>Malejąco</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {filtered.length === 0 ? (
          <p className='text-muted-foreground'>Brak klientów do wyświetlenia.</p>
        ) : (
          filtered.map(client => (
            <Card key={client.id} className='p-4 border rounded-xl shadow-sm opacity-90'>
              {/* Linia 1: Tylko nazwa */}
              <div className='text-base font-semibold mb-1'>{client.name}</div>

              {/* Linia 2: adres, telefon, przyciski */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground'>
                <div className='flex flex-wrap gap-4'>
                  {client.address && <span>📍 {client.address}</span>}
                  {client.phone && <span>☎ {client.phone}</span>}
                </div>

                <div className='flex gap-2 justify-end'>
                  <Link href={`/clients/edit?id=${client.id}`}>
                    <Button size='sm' variant='outline'>
                      <Pencil className='w-4 h-4' />
                    </Button>
                  </Link>

                  <Dialog
                    open={selectedClient?.id === client.id}
                    onOpenChange={open => !open && setSelectedClient(null)}
                  >
                    <DialogTrigger asChild>
                      <Button type='button' size='sm' variant='destructive' onClick={() => setSelectedClient(client)}>
                        <Trash className='w-4 h-4' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogTitle>Potwierdź usunięcie</DialogTitle>
                      <DialogDescription>
                        Czy na pewno chcesz usunąć <strong>{client.name}</strong>?
                      </DialogDescription>
                      <DialogFooter className='mt-4 flex gap-2'>
                        <Button type='button' variant='outline' onClick={() => setSelectedClient(null)}>
                          Anuluj
                        </Button>
                        <Button type='button' variant='destructive' onClick={() => handleDelete(client.id)}>
                          Usuń
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
