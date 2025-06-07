'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTransactions } from '@/utils/transactionStorage';
import { Transaction } from '@/types';
import TransactionForm from '@/components/TransactionForm';
import { ArrowLeft, ReceiptText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { handleExport } from '@/utils/pdfExport';
import { useTranslations } from 'next-intl';

export default function TransactionViewContent() {
  const t = useTranslations('transactionView');
  const pdfT = useTranslations('pdfLabels');

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const from = searchParams.get('from');
  const backUrl = from === 'calendar' ? '/transactions/calendar' : '/transactions';
  const router = useRouter();

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

  useEffect(() => {
    if (!id) {
      router.push(backUrl);
      return;
    }

    const all = getTransactions();
    const found = all.find(tx => tx.id === id);
    if (!found) {
      router.push(backUrl);
      return;
    }

    setTransaction(found);
  }, [id, router, backUrl]);

  if (!transaction) return null;

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl'>
        <CardContent className='space-y-6'>
          <div className='max-w-2xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <ReceiptText className='w-8 h-8 text-violet-600 dark:text-violet-300' />
                {t('title')}
              </h1>
              <div className='flex gap-2'>
                <Link href={backUrl}>
                  <Button variant='ghost' className='flex items-center gap-2 text-sm'>
                    <ArrowLeft className='w-4 h-4' />
                    {t('back')}
                  </Button>
                </Link>
              </div>
            </div>

            <TransactionForm editingTransaction={transaction} readOnly />

            <Button
              variant='outline'
              onClick={() => handleExport(transaction, exportLabels)}
              className='flex items-center gap-2 text-sm p-4 mt-4'
            >
              <Download className='w-4 h-4' />
              {t('export')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

