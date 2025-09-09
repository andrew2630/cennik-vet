'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { getTransactions } from '@/utils/transactionStorage';
import { getProducts } from '@/utils/productStorage';
import { getClients } from '@/utils/clientStorage';
import { MapPin } from 'lucide-react';
import { getSettings } from '@/utils/settingsStorage';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/types';

interface TravelRow {
  date: string;
  client: string;
  distance: number;
  value: number;
}

export default function TravelReportPageContent() {
  const t = useTranslations('travelReport');
  const listT = useTranslations('transactionsList');
  const itemTypeT = useTranslations('itemType');
  const params = useSearchParams();
  const from = params.get('from');
  const to = params.get('to');
  const method = params.get('method') as PaymentMethod | null;
  const [rows, setRows] = useState<TravelRow[]>([]);
  const { distanceUnit, currency } = getSettings();

  useEffect(() => {
    const txs = getTransactions();
    const products = getProducts();
    const clients = getClients();
    const filtered = txs.filter(tx => {
      const d = dayjs(tx.date);
      return (
        (!from || d.isAfter(dayjs(from).subtract(1, 'day'))) &&
        (!to || d.isBefore(dayjs(to).add(1, 'day'))) &&
        (!method || tx.paymentMethod === method)
      );
    });
    const data: TravelRow[] = [];
    filtered.forEach(tx => {
      const clientName = clients.find(c => c.id === tx.clientId)?.name || listT('unknownClient');
      tx.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod && prod.name.toLowerCase() === itemTypeT('travel').toLowerCase()) {
          const value = item.quantity * prod.pricePerUnit;
          const distance = distanceUnit === 'mi' ? item.quantity * 0.621371 : item.quantity;
          data.push({
            date: dayjs(tx.date).format('YYYY-MM-DD'),
            client: clientName,
            distance,
            value,
          });
        }
      });
    });
    setRows(data);
    if (data.length === 0) {
      toast.error(t('noData'));
    }
  }, [from, to, method, listT, itemTypeT, distanceUnit, t]);

  const totalDistance = rows.reduce((sum, r) => sum + r.distance, 0);
  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);

  const chartData = Object.values(
    rows.reduce((acc, r) => {
      if (!acc[r.date]) acc[r.date] = { date: r.date, distance: 0 };
      acc[r.date].distance += r.distance;
      return acc;
    }, {} as Record<string, { date: string; distance: number }>)
  );

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl p-4'>
        <CardContent className='p-2 space-y-6'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <MapPin className='w-8 h-8 text-indigo-600 dark:text-indigo-300' />
                {t('title')}
              </h1>
              <Link href='/transactions'>
                <Button variant='ghost' className='flex items-center gap-2 text-sm'>
                  <ArrowLeft className='w-4 h-4' />
                  {t('back')}
                </Button>
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg text-center shadow'>
                <p className='text-sm font-medium text-blue-800 dark:text-blue-200'>{t('totalDistance')}</p>
                <p className='text-2xl font-bold text-blue-600 dark:text-blue-300'>
                  {totalDistance} {distanceUnit}
                </p>
              </div>
              <div className='bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center shadow'>
                <p className='text-sm font-medium text-green-800 dark:text-green-200'>{t('totalValue')}</p>
                <p className='text-2xl font-bold text-green-600 dark:text-green-300'>
                  {totalValue.toFixed(2)} {currency}
                </p>
              </div>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='distance' fill='#3b82f6' />
              </BarChart>
            </ResponsiveContainer>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader className='bg-indigo-50 dark:bg-slate-800'>
                  <TableRow>
                    <TableHead className='font-bold text-indigo-800 dark:text-indigo-200'>{t('date')}</TableHead>
                    <TableHead className='font-bold text-indigo-800 dark:text-indigo-200'>{t('client')}</TableHead>
                    <TableHead className='font-bold text-indigo-800 dark:text-indigo-200'>
                      {t('distance')} ({distanceUnit})
                    </TableHead>
                    <TableHead className='font-bold text-indigo-800 dark:text-indigo-200'>{t('value')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center font-semibold'>
                        {t('noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, idx) => (
                      <TableRow
                        key={idx}
                        className='odd:bg-white even:bg-indigo-50 dark:odd:bg-slate-800 dark:even:bg-slate-700'
                      >
                        <TableCell className='font-medium'>{r.date}</TableCell>
                        <TableCell className='font-medium'>{r.client}</TableCell>
                        <TableCell className='text-indigo-700 dark:text-indigo-300'>
                          {r.distance} {distanceUnit}
                        </TableCell>
                        <TableCell className='text-green-700 dark:text-green-300'>
                          {r.value.toFixed(2)} {currency}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
