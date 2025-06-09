'use client';

import { Suspense } from 'react';
import useDataUpdate from '@/utils/useDataUpdate';
import Link from 'next/link';
import { PlusCircle, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TransactionList from '@/components/TransactionList';
import { useTranslations } from 'next-intl';

export default function TransactionsPage() {
  const refresh = useDataUpdate();
  const t = useTranslations('transactions');

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

              <Link href='/transactions/new'>
                <Button variant='default' className='flex items-center gap-2'>
                  <PlusCircle className='w-4 h-4' />
                  {t('addButton')}
                </Button>
              </Link>
            </div>

            <TransactionList refresh={refresh} />
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
