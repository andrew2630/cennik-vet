'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Transaction, Client } from '@/types';
import { getTransactions, deleteTransaction } from '@/utils/transactionStorage';
import { getClients } from '@/utils/clientStorage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function TransactionList({ refresh }: { refresh: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'date' | 'client'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTransactions(getTransactions());
    setClients(getClients());
  }, [refresh]);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Nieznany klient';

  const filtered = transactions
    .filter(tx => {
      const clientName = getClientName(tx.clientId).toLowerCase();
      return clientName.includes(search.toLowerCase()) || tx.date.includes(search);
    })
    .sort((a, b) => {
      const aValue = sortField === 'client' ? getClientName(a.clientId).toLowerCase() : a.date;
      const bValue = sortField === 'client' ? getClientName(b.clientId).toLowerCase() : b.date;
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setTransactions(getTransactions());
    setSelectedTx(null);
  };

  return (
    <Card className='mt-6 bg-transparent backdrop-blur-xs'>
      <CardHeader className='flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4'>
          <CardTitle className='py-2'>Ostatnie transakcje</CardTitle>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'>
          <Input
            className='min-w-[200px] sm:min-w-[300px]'
            placeholder='Szukaj po nazwie klienta lub dacie...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className='flex flex-row gap-2 md:items-center'>
          <Select value={sortField} onValueChange={(val: 'date' | 'client') => setSortField(val)}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Sortuj wg' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='date'>Data</SelectItem>
              <SelectItem value='client'>Klient</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(val: 'asc' | 'desc') => setSortOrder(val)}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Kolejność' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Rosnąco</SelectItem>
              <SelectItem value='desc'>Malejąco</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {filtered.length === 0 ? (
          <p className='text-muted-foreground'>Brak rozliczeń do wyświetlenia.</p>
        ) : (
          filtered.map(tx => {
            const client = clients.find(c => c.id === tx.clientId);
            const targetHref =
              tx.status === 'finalised' ? `/transactions/view?id=${tx.id}` : `/transactions/edit?id=${tx.id}`;

            return (
              <Link key={tx.id} href={targetHref} passHref>
                <Card
                  onClick={e => {
                    if ((e.target as HTMLElement).closest('button')) return;

                    router.push(targetHref);
                  }}
                  className='p-5 gap-4 mb-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm cursor-pointer hover:scale-[1.01]'
                >
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                    <div className='text-sm text-muted-foreground'>
                      <strong>Data:</strong>{' '}
                      {new Date(tx.date).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    <div className='text-sm'>
                      <strong>Klient:</strong> <span className='font-medium'>{client?.name || 'Nieznany klient'}</span>
                      {client?.address && <span className='text-muted-foreground'> • {client.address}</span>}
                      {client?.phone && <span className='text-muted-foreground'> • tel. {client.phone}</span>}
                    </div>

                    <div className='text-sm font-medium'>
                      <strong>Kwota:</strong>{' '}
                      <span className='text-sm font-bold text-green-700 dark:text-green-400'>
                        {tx.totalPrice.toFixed(2)} zł
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                    <div className='text-sm flex items-center gap-2'>
                      <strong>Status:</strong>
                      <Badge
                        variant={tx.status === 'finalised' ? 'default' : 'secondary'}
                        className={`text-white ${tx.status === 'finalised' ? 'bg-emerald-600' : 'bg-gray-500'}`}
                      >
                        {tx.status === 'finalised' ? '✔ Zrealizowano' : '📝 W trakcie'}
                      </Badge>
                    </div>

                    <div className='flex gap-2' onClick={e => e.stopPropagation()}>
                      <Link href={`/transactions/view?id=${tx.id}`}>
                        <Button size='sm' variant='outline' onClick={e => e.stopPropagation()}>
                          <FileText className='w-4 h-4' />
                        </Button>
                      </Link>
                      <Link href={`/transactions/edit?id=${tx.id}`}>
                        <Button size='sm' variant='outline' onClick={e => e.stopPropagation()}>
                          <Pencil className='w-4 h-4' />
                        </Button>
                      </Link>

                      <Dialog open={selectedTx?.id === tx.id} onOpenChange={open => !open && setSelectedTx(null)}>
                        <DialogTrigger asChild>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTx(tx);
                            }}
                          >
                            <Trash className='w-4 h-4' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-md'>
                          <DialogTitle>Potwierdź usunięcie</DialogTitle>
                          <DialogDescription>
                            Czy na pewno chcesz usunąć rozliczenie dla <strong>{client?.name}</strong> z dnia{' '}
                            {new Date(tx.date).toLocaleDateString('pl-PL')}?
                          </DialogDescription>
                          <DialogFooter className='mt-4 flex gap-2'>
                            <Button type='button' variant='outline' onClick={() => setSelectedTx(null)}>
                              Anuluj
                            </Button>
                            <Button type='button' variant='destructive' onClick={() => handleDelete(tx.id)}>
                              Usuń
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
