'use client';

import { useEffect, useState } from 'react';
import { getClients, deleteClient } from '@/utils/clientStorage';
import { Client } from '@/types';
import { useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash, MapPin, Phone } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

export default function ClientList({ refresh }: { refresh: number }) {
  const t = useTranslations('clientList');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'address'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

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
    <Card className='mt-6 bg-transparent backdrop-blur-xs'>
      <CardHeader className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex flex-col md:flex-row md:items-center md:gap-4 w-full'>
          <CardTitle>{t('title')}</CardTitle>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'>
          <Input
            className='min-w-[50px] sm:min-w-[80px]'
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select value={sortField} onValueChange={(val: 'name' | 'address') => setSortField(val)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder={t('sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='name'>{t('sortOptions.name')}</SelectItem>
              <SelectItem value='address'>{t('sortOptions.address')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(val: 'asc' | 'desc') => setSortOrder(val)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder={t('order')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>{t('orderOptions.asc')}</SelectItem>
              <SelectItem value='desc'>{t('orderOptions.desc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {filtered.length === 0 ? (
          <p className='text-muted-foreground'>{t('empty')}</p>
        ) : (
          filtered.map(client => (
            <Card
              key={client.id}
              onClick={e => {
                const isButton = (e.target as HTMLElement).closest('button');
                if (!isButton) {
                  router.push(`/clients/edit?id=${client.id}`);
                }
              }}
              className='p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm cursor-pointer hover:scale-[1.01]'
            >
              <div className='text-base font-semibold'>{client.name}</div>

              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground'>
                <div className='flex flex-wrap gap-4 items-center text-sm text-muted-foreground'>
                  {client.address && (
                    <span className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      {client.address}
                    </span>
                  )}
                  {client.phone && (
                    <span className='flex items-center gap-1'>
                      <Phone className='w-4 h-4' />
                      {client.phone}
                    </span>
                  )}
                </div>

                <div className='flex gap-2 justify-end'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={e => {
                      e.stopPropagation();
                      router.push(`/clients/edit?id=${client.id}`);
                    }}
                  >
                    <Pencil className='w-4 h-4' />
                  </Button>

                  <Dialog
                    open={selectedClient?.id === client.id}
                    onOpenChange={open => !open && setSelectedClient(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type='button'
                        size='sm'
                        variant='destructive'
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedClient(client);
                        }}
                      >
                        <Trash className='w-4 h-4' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogTitle>{t('confirmDelete')}</DialogTitle>
                      <DialogDescription>
                        {t('deleteQuestion')} <strong>{client.name}</strong>?
                      </DialogDescription>
                      <DialogFooter className='mt-4 flex gap-2'>
                        <Button type='button' variant='outline' onClick={() => setSelectedClient(null)}>
                          {t('cancel')}
                        </Button>
                        <Button type='button' variant='destructive' onClick={() => handleDelete(client.id)}>
                          {t('delete')}
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
