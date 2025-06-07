'use client';

import { useEffect, useState } from 'react';
import { getTransactions } from '@/utils/transactionStorage';
import { getClients } from '@/utils/clientStorage';
import { Transaction, Client } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function CalendarPage() {
  const t = useTranslations('calendar');
  const locale = useLocale();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const router = useRouter();

  const dateFnsLocale = locale === 'pl' ? pl : enUS;

  useEffect(() => {
    setTransactions(getTransactions());
    setClients(getClients());
  }, []);

  const formatDate = (date: Date) => date.toLocaleDateString('sv-SE'); // ISO-like YYYY-MM-DD

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || t('unknownClient');

  const txByDate = transactions.reduce((acc, tx) => {
    const key = tx.date.split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const filteredTx = selectedDate ? txByDate[selectedDate] || [] : [];

  const weekDays = t.raw('weekDays') as string[];

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl p-4 backdrop-blur-xs'>
        <CardContent className='p-2 space-y-6'>
          <div className='max-w-4xl mx-auto p-4'>
            <div className='flex justify-between items-center mb-4'>
              <Button variant='outline' onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                {t('prevMonth')}
              </Button>
              <h1 className='text-2xl font-bold'>{format(currentDate, 'LLLL yyyy', { locale: dateFnsLocale })}</h1>
              <Button variant='outline' onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                {t('nextMonth')}
              </Button>
            </div>

            <div className='grid grid-cols-7 gap-2 text-center font-semibold text-muted-foreground mb-2'>
              {weekDays.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className='grid grid-cols-7 gap-2'>
              {Array(getDay(start))
                .fill(null)
                .map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

              {days.map(d => {
                const iso = formatDate(d);
                const txList = txByDate[iso] || [];
                const isSelected = selectedDate === iso;

                return (
                  <button
                    key={iso}
                    className={`rounded-xl p-3 text-sm flex flex-col items-center justify-center transition-all border
                        ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-300 shadow-md' : ''}
                        ${
                          txList.length > 0
                            ? 'bg-green-100 dark:bg-green-800/40 border-green-400 dark:border-green-600 text-green-900 dark:text-green-100'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100'
                        }
                        hover:scale-105`}
                    onClick={() => setSelectedDate(iso)}
                  >
                    <span className='font-bold'>{d.getDate()}</span>
                    {txList.length > 0 && (
                      <span className='text-xs mt-1 bg-green-600 text-white dark:bg-green-500 px-2 py-0.5 rounded-full'>
                        {txList.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className='mt-6 space-y-4'>
                <h2 className='text-lg font-semibold'>
                  {t('transactionsFor', {
                    date: format(new Date(selectedDate), 'dd.MM.yyyy'),
                  })}
                </h2>

                {filteredTx.map(tx => (
                  <Card
                    key={tx.id}
                    onClick={() =>
                      router.push(
                        tx.status === 'finalised'
                          ? `/transactions/view?id=${tx.id}&from=calendar`
                          : `/transactions/edit?id=${tx.id}&from=calendar`
                      )
                    }
                    className='p-5 gap-4 mb-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm cursor-pointer hover:scale-[1.01]'
                  >
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                      <div className='text-sm text-muted-foreground'>
                        <strong>{t('date')}:</strong>{' '}
                        {new Date(tx.date).toLocaleDateString(locale, {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      <div className='text-sm'>
                        <strong>{t('client')}:</strong>{' '}
                        <span className='font-medium'>{getClientName(tx.clientId)}</span>
                        {clients.find(c => c.id === tx.clientId)?.address && (
                          <span className='text-muted-foreground'>
                            {' '}
                            • {clients.find(c => c.id === tx.clientId)?.address}
                          </span>
                        )}
                        {clients.find(c => c.id === tx.clientId)?.phone && (
                          <span className='text-muted-foreground'>
                            {' '}
                            • tel. {clients.find(c => c.id === tx.clientId)?.phone}
                          </span>
                        )}
                      </div>

                      <div className='text-sm font-medium'>
                        <strong>{t('amount')}:</strong>{' '}
                        <span className='text-sm font-bold text-green-700 dark:text-green-400'>
                          {tx.totalPrice.toFixed(2)} zł
                        </span>
                      </div>
                    </div>

                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                      <div className='text-sm flex items-center gap-2'>
                        <strong>{t('status')}:</strong>
                        <Badge
                          variant={tx.status === 'finalised' ? 'default' : 'secondary'}
                          className={`text-white ${tx.status === 'finalised' ? 'bg-emerald-600' : 'bg-gray-500'}`}
                        >
                          {tx.status === 'finalised' ? t('statusFinalised') : t('statusDraft')}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
