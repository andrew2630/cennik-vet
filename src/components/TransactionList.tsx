'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Transaction, Client } from '@/types';
import { getTransactions, deleteTransaction } from '@/utils/transactionStorage';
import { getClients } from '@/utils/clientStorage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
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
    <Card className='mt-6'>
      <CardHeader className='flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4'>
          <CardTitle className='py-2'>Ostatnie transakcje</CardTitle>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'>
          <Input
            className='min-w-[200px] sm:min-w-[250px]'
            placeholder='Szukaj po nazwie klienta lub dacie...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <Select value={sortField} onValueChange={val => setSortField(val as any)}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Sortuj wg' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='date'>Data</SelectItem>
              <SelectItem value='client'>Klient</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={val => setSortOrder(val as any)}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Kolejność' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Rosnąco</SelectItem>
              <SelectItem value='desc'>Malejąco</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <p className='text-muted-foreground'>Brak faktur do wyświetlenia.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead className='text-right'>Kwota</TableHead>
                <TableHead className='text-right'>Status</TableHead>
                <TableHead className='text-right'>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {new Date(tx.date).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{getClientName(tx.clientId)}</TableCell>
                  <TableCell className='text-right'>{tx.totalPrice.toFixed(2)} zł</TableCell>
                  <TableCell className='text-right'>
                    <Badge variant={tx.status === 'finalised' ? 'default' : 'secondary'}>
                      {tx.status === 'finalised' ? 'Zrealizowana' : 'Robocza'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right space-x-2'>
                    <Link href={`/transactions/view?id=${tx.id}`}>
                      <Button size='sm' variant='outline'>
                        <FileText className='w-4 h-4' />
                      </Button>
                    </Link>
                    <>
                      <Link href={`/transactions/edit?id=${tx.id}`}>
                        <Button size='sm' variant='outline'>
                          <Pencil className='w-4 h-4' />
                        </Button>
                      </Link>
                      <Dialog open={selectedTx?.id === tx.id} onOpenChange={open => !open && setSelectedTx(null)}>
                        <DialogTrigger asChild>
                          <Button size='sm' variant='destructive' onClick={() => setSelectedTx(tx)}>
                            <Trash className='w-4 h-4' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-md'>
                          <DialogTitle>Potwierdź usunięcie</DialogTitle>
                          <DialogDescription>
                            Czy na pewno chcesz usunąć rozliczenie dla <strong>{getClientName(tx.clientId)}</strong> z dnia{' '}
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
                    </>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
