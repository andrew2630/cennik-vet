'use client';

import { Suspense, useState } from 'react';
import useDataUpdate from '@/utils/useDataUpdate';
import Link from 'next/link';
import { PlusCircle, ReceiptText, FileDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TransactionList from '@/components/TransactionList';
import { useTranslations } from 'next-intl';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { handleExportRange } from '@/utils/pdfExport';
import { getTransactions } from '@/utils/transactionStorage';
import { getProducts } from '@/utils/productStorage';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { PaymentMethod } from '@/types';

export default function TransactionsPage() {
  const refresh = useDataUpdate();
  const t = useTranslations('transactions');
  const pdfT = useTranslations('pdfLabels');
  const itemTypeT = useTranslations('itemType');
  const listT = useTranslations('transactionsList');
  const formT = useTranslations('transactionForm');
  const router = useRouter();
  const [expRange, setExpRange] = useState<DateRange | undefined>();
  const [repRange, setRepRange] = useState<DateRange | undefined>();
  const [expMethod, setExpMethod] = useState<'all' | PaymentMethod>('all');
  const [repMethod, setRepMethod] = useState<'all' | PaymentMethod>('all');

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
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <ReceiptText className='w-8 h-8 text-green-600 dark:text-green-300' />
                {t('title')}
              </h1>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto'>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline' className='flex items-center gap-2 w-full sm:w-auto justify-center'>
                      <FileDown className='w-4 h-4' />
                      {t('exportRange')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>{t('exportRange')}</DialogTitle>
                    </DialogHeader>
                    <div className='py-2 space-y-2'>
                      <Calendar
                        mode='range'
                        selected={expRange}
                        onSelect={setExpRange}
                        numberOfMonths={1}
                        className='rounded-md border'
                      />
                      <Select value={expMethod} onValueChange={(val: 'all' | PaymentMethod) => setExpMethod(val)}>
                        <SelectTrigger>
                          <SelectValue placeholder={formT('paymentMethod')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>{listT('all')}</SelectItem>
                          <SelectItem value='cash'>{formT('paymentCash')}</SelectItem>
                          <SelectItem value='transfer'>{formT('paymentTransfer')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          const from = expRange?.from ? dayjs(expRange.from).format('YYYY-MM-DD') : '';
                          const to = expRange?.to ? dayjs(expRange.to).format('YYYY-MM-DD') : '';
                          const txs = getTransactions()
                            .filter(tx => {
                              const d = dayjs(tx.date);
                              return (
                                (!from || d.isAfter(dayjs(from).subtract(1, 'day')))
                                && (!to || d.isBefore(dayjs(to).add(1, 'day')))
                              );
                            })
                            .filter(tx => expMethod === 'all' || tx.paymentMethod === expMethod)
                            .sort((a, b) => a.date.localeCompare(b.date));
                          if (txs.length === 0) {
                            toast.error(t('noTransactionsError'));
                            return;
                          }
                          handleExportRange(txs, exportLabels, from || 'start', to || 'end');
                        }}
                      >
                        {t('generate')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline' className='flex items-center gap-2 w-full sm:w-auto justify-center'>
                      <MapPin className='w-4 h-4' />
                      {t('travelReport')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>{t('travelReport')}</DialogTitle>
                    </DialogHeader>
                    <div className='py-2 space-y-2'>
                      <Calendar
                        mode='range'
                        selected={repRange}
                        onSelect={setRepRange}
                        numberOfMonths={1}
                        className='rounded-md border'
                      />
                      <Select value={repMethod} onValueChange={(val: 'all' | PaymentMethod) => setRepMethod(val)}>
                        <SelectTrigger>
                          <SelectValue placeholder={formT('paymentMethod')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>{listT('all')}</SelectItem>
                          <SelectItem value='cash'>{formT('paymentCash')}</SelectItem>
                          <SelectItem value='transfer'>{formT('paymentTransfer')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          const from = repRange?.from ? dayjs(repRange.from).format('YYYY-MM-DD') : '';
                          const to = repRange?.to ? dayjs(repRange.to).format('YYYY-MM-DD') : '';
                          const txs = getTransactions()
                            .filter(tx => {
                              const d = dayjs(tx.date);
                              return (
                                (!from || d.isAfter(dayjs(from).subtract(1, 'day')))
                                && (!to || d.isBefore(dayjs(to).add(1, 'day')))
                              );
                            })
                            .filter(tx => repMethod === 'all' || tx.paymentMethod === repMethod);
                          const products = getProducts();
                          const hasTravel = txs.some(tx =>
                            tx.items.some(item => {
                              const prod = products.find(p => p.id === item.productId);
                              return (
                                prod &&
                                prod.name.toLowerCase() ===
                                  itemTypeT('travel').toLowerCase()
                              );
                            })
                          );
                          if (!hasTravel) {
                            toast.error(t('noTravelError'));
                            return;
                          }
                          const params = new URLSearchParams();
                          if (from) params.set('from', from);
                          if (to) params.set('to', to);
                          router.push(`/transactions/travel-report?${params.toString()}`);
                        }}
                      >
                        {t('generate')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Link href='/transactions/new' className='w-full sm:w-auto'>
                  <Button variant='default' className='flex items-center gap-2 w-full justify-center'>
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
