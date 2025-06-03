'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ReceiptText } from 'lucide-react';

import TransactionForm from '@/components/TransactionForm';
import { getTransactions } from '@/utils/transactionStorage';
import { Transaction } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Theme from '@/components/Theme';

function EditTransactionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const from = searchParams.get('from');
  const backUrl = from === 'calendar' ? '/transactions/calendar' : '/transactions';

  const [transaction, setTransaction] = React.useState<Transaction | undefined>(undefined);

  React.useEffect(() => {
    if (!id) return;
    const all = getTransactions();
    const found = all.find(tx => tx.id === id);
    if (found) {
      setTransaction(found);
    } else {
      router.push('/transactions');
    }
  }, [id, router]);

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl'>
        <CardContent className='space-y-6'>
          <div className='max-w-2xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <ReceiptText className='w-8 h-8 text-amber-600 dark:text-amber-300' />
                Edycja rozliczenia
              </h1>
              <Link href={backUrl}>
                <Button variant='ghost' className='flex items-center gap-2 text-sm'>
                  <ArrowLeft className='w-4 h-4' />
                  Wróć
                </Button>
              </Link>
            </div>
            {transaction && (
              <TransactionForm
                editingTransaction={transaction}
                onSaved={() => router.push(backUrl)}
                onCancel={() => router.push(backUrl)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditTransactionPage() {
  return (
    <Theme>
      <Suspense>
        <EditTransactionContent />
      </Suspense>
    </Theme>
  );
}
