'use client';

import { useEffect, useState } from 'react';
import { getClients } from '@/utils/clientStorage';
import { getTransactions } from '@/utils/transactionStorage';
import { getProducts } from '@/utils/productStorage';
import type { Client, Transaction, Product } from '@/types';
import DashboardHome from '@/components/pages/DashboardHome';
import PageWrapper from '@/components/PageWrapper';

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
    <PageWrapper>
      <DashboardHome />
    </PageWrapper>
  );
}
