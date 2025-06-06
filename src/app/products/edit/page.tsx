'use client';

import ProductForm from '@/components/ProductForm';
import Link from 'next/link';
import { ArrowLeft, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Theme from '@/components/Theme';
import { Suspense } from 'react';

export default function EditProductPage() {
  return (
    <Theme>
      <Suspense>
        <div className='max-w-2xl mx-auto'>
          <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl'>
            <CardContent className='space-y-6'>
              <div className='max-w-2xl mx-auto'>
                <div className='flex items-center justify-between mb-6'>
                  <h1 className='text-3xl font-bold flex items-center gap-3'>
                    <PackagePlus className='w-8 h-8 text-indigo-600 dark:text-indigo-300' />
                    Edytuj produkt
                  </h1>
                  <Link href='/products'>
                    <Button variant='ghost' className='flex items-center gap-2 text-sm'>
                      <ArrowLeft className='w-4 h-4' />
                      Wróć
                    </Button>
                  </Link>
                </div>
                <ProductForm onAdd={() => {}} />
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    </Theme>
  );
}
