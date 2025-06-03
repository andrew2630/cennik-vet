'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  ReceiptText,
  CalendarDays,
  Package,
  Settings as SettingsIcon,
} from 'lucide-react';

import Theme from '@/components/Theme';
import { Card, CardContent } from '@/components/ui/card';
import { getClients } from '@/utils/clientStorage';
import { getTransactions } from '@/utils/transactionStorage';
import { getProducts } from '@/utils/productStorage';
import type { Client, Transaction, Product } from '@/types';

export default function HomePage() {
  const [, setClients] = useState<Client[]>([]);
  const [, setTransactions] = useState<Transaction[]>([]);
  const [, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setClients(getClients());
    setTransactions(getTransactions());
    setProducts(getProducts());
  }, []);

  return (
    <Theme>
      <div className="relative z-0 py-8 px-4">
        <motion.div
          layout
          className="relative grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 max-w-5xl mx-auto"
        >
          {[
            {
              title: 'Klienci',
              href: '/clients',
              icon: <Users className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />,
              gradient: 'from-indigo-500/15 to-indigo-700/15',
            },
            {
              title: 'Rozliczenia',
              href: '/transactions',
              icon: <ReceiptText className="w-8 h-8 text-green-600 dark:text-green-400" />,
              gradient: 'from-green-500/15 to-green-700/15',
            },
            {
              title: 'Kalendarz',
              href: '/transactions/calendar',
              icon: <CalendarDays className="w-8 h-8 text-blue-500 dark:text-blue-300" />,
              gradient: 'from-blue-500/15 to-blue-700/15',
            },
            {
              title: 'Usługi i Produkty',
              href: '/products',
              icon: <Package className="w-8 h-8 text-yellow-500 dark:text-yellow-300" />,
              gradient: 'from-yellow-500/15 to-yellow-700/15',
            },
            {
              title: 'Ustawienia',
              href: '/settings',
              icon: <SettingsIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />,
              gradient: 'from-gray-500/15 to-gray-700/15',
            },
          ].map((item, i) => (
            <motion.div
              layout
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="transition-all"
            >
              <Card
                className={`rounded-3xl border border-white/10 backdrop-blur-xs bg-gradient-to-tr ${item.gradient} hover:shadow-xl shadow-md`}
              >
                <Link href={item.href}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-foreground">
                      {item.icon}
                      <h2 className="text-2xl font-semibold tracking-tight dark:drop-shadow">
                        {item.title}
                      </h2>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Theme>
  );
}
