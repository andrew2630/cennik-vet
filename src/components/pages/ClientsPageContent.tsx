'use client';

import useDataUpdate from '@/utils/useDataUpdate';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ClientList from '@/components/ClientList';
import { UserPlus, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClientsPage() {
  const refresh = useDataUpdate();
  const t = useTranslations('clientsPage');

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl p-4'>
        <CardContent className='p-2 space-y-6'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-3xl font-bold flex items-center gap-3'>
              <Users className='w-8 h-8 text-indigo-600 dark:text-indigo-300' />
              {t('title')}
            </h1>

            <Link href='/clients/new'>
              <Button className='flex items-center gap-2'>
                <UserPlus className='w-4 h-4' />
                {t('add')}
              </Button>
            </Link>
          </div>

          <ClientList refresh={refresh} />
        </CardContent>
      </Card>
    </div>
  );
}
