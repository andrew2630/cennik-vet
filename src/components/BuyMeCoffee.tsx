'use client';

import { Coffee } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BuyMeCoffee() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <div className='fixed bottom-6 left-6 z-50'>
      <Link href='https://coff.ee/random_artistic_stuff' target='_blank' rel='noopener noreferrer'>
        <div className='p-3 rounded-full shadow-lg bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'>
          <Coffee className='w-5 h-5 text-gray-700 dark:text-white' />
        </div>
      </Link>
    </div>
  );
}
