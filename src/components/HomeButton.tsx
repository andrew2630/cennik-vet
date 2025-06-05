'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function HomeButton() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <Link href='/'>
        <div className='p-3 rounded-full shadow-lg bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'>
          <Home className='w-5 h-5 text-gray-700 dark:text-white' />
        </div>
      </Link>
    </div>
  );
}
