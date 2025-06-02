'use client';

import ClientForm from '@/components/ClientForm';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Theme from '@/components/Theme';
import { Suspense } from 'react';

export default function NewClientPage() {
  return (
    <Theme>
      <Suspense>
        <div className='max-w-2xl mx-auto'>
          <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl'>
            <CardContent className='space-y-6'>
              <div className='max-w-2xl mx-auto p-4'>
                <div className='flex items-center justify-between mb-6'>
                  <h1 className='text-3xl font-bold flex items-center gap-3'>
                    <UserPlus className='w-7 h-7 text-indigo-600 dark:text-indigo-300' />
                    Dodaj nowego klienta
                  </h1>
                  <Link href='/clients'>
                    <Button variant='ghost' className='flex items-center gap-2 text-sm'>
                      <ArrowLeft className='w-4 h-4' />
                      Wróć
                    </Button>
                  </Link>
                </div>
                <ClientForm onAdd={() => {}} />
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    </Theme>
  );
}
