'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getClients } from '@/utils/clientStorage';
import { getTransactions } from '@/utils/transactionStorage';
import type { Client, Transaction, Product, ThemeSettings } from '@/types';
import { getProducts } from '@/utils/productStorage';
import { getSettings } from '@/utils/settingsStorage';
import { motion } from 'framer-motion';
import { Users, ReceiptText, CalendarDays, Package, Settings as SettingsIcon } from 'lucide-react';

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setClients(getClients());
    setTransactions(getTransactions());
    setProducts(getProducts());
    const settings = getSettings();
    applyTheme(settings.theme);
  }, []);

  const applyTheme = (theme: ThemeSettings['theme']): void => {
    const root: HTMLElement = document.documentElement;
    const isDark: boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (theme === 'system' && isDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  return (
    <div className='relative'>
      <motion.div
        layout
        className='relative grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-6 z-10'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        {[
          {
            title: 'Klienci',
            href: '/clients',
            icon: <Users className='w-8 h-8 text-indigo-600 dark:text-indigo-300' />,
          },
          {
            title: 'Rozliczenia',
            href: '/transactions',
            icon: <ReceiptText className='w-8 h-8 text-green-600 dark:text-green-300' />,
          },
          {
            title: 'Kalendarz',
            href: '/transactions/calendar',
            icon: <CalendarDays className='w-8 h-8 text-blue-600 dark:text-blue-300' />,
          },
          {
            title: 'Usługi i Produkty',
            href: '/products',
            icon: <Package className='w-8 h-8 text-yellow-600 dark:text-yellow-300' />,
          },
          {
            title: 'Ustawienia',
            href: '/settings',
            icon: <SettingsIcon className='w-8 h-8 text-gray-600 dark:text-gray-300' />,
          },
        ].map((item, i) => (
          <motion.div layout key={i} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} className='transition-all'>
            <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-300/30 via-sky-200/20 to-slate-200/20 dark:bg-gradient-to-tr dark:from-indigo-500/30 dark:via-sky-500/20 dark:to-slate-900/20 shadow-2xl hover:shadow-3xl'>
              <Link href={item.href}>
                <CardContent className='p-6'>
                  <h2 className='text-2xl font-bold flex items-center gap-3 drop-shadow tracking-tight'>
                    {item.icon}
                    {item.title}
                  </h2>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
