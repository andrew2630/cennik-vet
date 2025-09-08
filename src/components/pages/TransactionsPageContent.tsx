'use client';

import { Suspense, useState } from 'react';
import useDataUpdate from '@/utils/useDataUpdate';
import Link from 'next/link';
import { PlusCircle, ReceiptText, FileDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TransactionList from '@/components/TransactionList';
import { useTranslations } from 'next-intl';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { handleExportRange } from '@/utils/pdfExport';
import { getTransactions } from '@/utils/transactionStorage';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const refresh = useDataUpdate();
  const t = useTranslations('transactions');
  const pdfT = useTranslations('pdfLabels');
  const router = useRouter();
  const [expFrom, setExpFrom] = useState('');
  const [expTo, setExpTo] = useState('');
  const [repFrom, setRepFrom] = useState('');
  const [repTo, setRepTo] = useState('');

  const exportLabels = {
    header: pdfT('header'),
    clientLabel: pdfT('clientLabel'),
    addressLabel: pdfT('addressLabel'),
    phoneLabel: pdfT('phoneLabel'),
    notFound: pdfT('notFound'),
    travel: pdfT('travel'),
    items: pdfT('items'),
    products: pdfT('products'),
    services: pdfT('services'),
    quantity: pdfT('quantity'),
    unit: pdfT('unit'),
    priceUnit: pdfT('priceUnit'),
    value: pdfT('value'),
    subtotal: pdfT('subtotal'),
    discount: pdfT('discount'),
    fee: pdfT('fee'),
    total: pdfT('total'),
    description: pdfT('description'),
  };

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <div className='max-w-2xl mx-auto'>
        <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl p-4'>
          <CardContent className='p-2 space-y-6'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <ReceiptText className='w-8 h-8 text-green-600 dark:text-green-300' />
                {t('title')}
              </h1>
              <div className='flex items-center gap-2'>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline' className='flex items-center gap-2'>
                      <FileDown className='w-4 h-4' />
                      {t('exportRange')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('exportRange')}</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col gap-4 py-2'>
                      <DatePicker value={expFrom} onChange={setExpFrom} placeholder={t('from')} />
                      <DatePicker value={expTo} onChange={setExpTo} placeholder={t('to')} />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        const txs = getTransactions().filter(tx => {
                          const d = dayjs(tx.date);
                          return (!expFrom || d.isAfter(dayjs(expFrom).subtract(1, 'day')))
                            && (!expTo || d.isBefore(dayjs(expTo).add(1, 'day')));
                        }).sort((a, b) => a.date.localeCompare(b.date));
                        handleExportRange(txs, exportLabels, expFrom || 'start', expTo || 'end');
                      }}>{t('generate')}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline' className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4' />
                      {t('travelReport')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('travelReport')}</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col gap-4 py-2'>
                      <DatePicker value={repFrom} onChange={setRepFrom} placeholder={t('from')} />
                      <DatePicker value={repTo} onChange={setRepTo} placeholder={t('to')} />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        const params = new URLSearchParams();
                        if (repFrom) params.set('from', repFrom);
                        if (repTo) params.set('to', repTo);
                        router.push(`/transactions/travel-report?${params.toString()}`);
                      }}>{t('generate')}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Link href='/transactions/new'>
                  <Button variant='default' className='flex items-center gap-2'>
                    <PlusCircle className='w-4 h-4' />
                    {t('addButton')}
                  </Button>
                </Link>
              </div>
            </div>

            <TransactionList refresh={refresh} />
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
