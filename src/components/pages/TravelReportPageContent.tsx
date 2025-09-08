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

interface TravelRow {
  date: string;
  client: string;
  km: number;
  value: number;
}

export default function TravelReportPageContent() {
  const t = useTranslations('travelReport');
  const listT = useTranslations('transactionsList');
  const itemTypeT = useTranslations('itemType');
  const params = useSearchParams();
  const from = params.get('from');
  const to = params.get('to');
  const [rows, setRows] = useState<TravelRow[]>([]);

  useEffect(() => {
    const txs = getTransactions();
    const products = getProducts();
    const clients = getClients();
    const filtered = txs.filter(tx => {
      const d = dayjs(tx.date);
      return (
        (!from || d.isAfter(dayjs(from).subtract(1, 'day')))
        && (!to || d.isBefore(dayjs(to).add(1, 'day')))
      );
    });
    const data: TravelRow[] = [];
    filtered.forEach(tx => {
      const clientName = clients.find(c => c.id === tx.clientId)?.name || listT('unknownClient');
      tx.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod && prod.name.toLowerCase() === itemTypeT('travel').toLowerCase()) {
          const value = item.quantity * prod.pricePerUnit;
          data.push({
            date: dayjs(tx.date).format('YYYY-MM-DD'),
            client: clientName,
            km: item.quantity,
            value,
          });
        }
      });
    });
    setRows(data);
  }, [from, to, listT, itemTypeT]);

  const totalKm = rows.reduce((sum, r) => sum + r.km, 0);
  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);

  const chartData = Object.values(
    rows.reduce((acc, r) => {
      if (!acc[r.date]) acc[r.date] = { date: r.date, km: 0 };
      acc[r.date].km += r.km;
      return acc;
    }, {} as Record<string, { date: string; km: number }>)
  );

  return (
    <div className='max-w-4xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl p-4'>
        <CardContent className='p-2 space-y-6'>
          <h1 className='text-3xl font-bold'>{t('title')}</h1>
          <div className='flex gap-4'>
            <span>{t('totalDistance')}: {totalKm}</span>
            <span>{t('totalValue')}: {totalValue.toFixed(2)}</span>
          </div>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey='date' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='km' fill='#3b82f6' />
            </BarChart>
          </ResponsiveContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('client')}</TableHead>
                <TableHead>{t('distance')}</TableHead>
                <TableHead>{t('value')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-center'>{t('noData')}</TableCell>
                </TableRow>
              ) : (
                rows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.client}</TableCell>
                    <TableCell>{r.km}</TableCell>
                    <TableCell>{r.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
