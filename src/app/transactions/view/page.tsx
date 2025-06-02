'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTransactions } from '@/utils/transactionStorage';
import { Transaction, Product } from '@/types';
import TransactionForm from '@/components/TransactionForm';
import { ArrowLeft, ReceiptText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getProducts } from '@/utils/productStorage';

export default function ViewTransactionPage() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.push('/transactions');
      return;
    }

    const all = getTransactions();
    const found = all.find(tx => tx.id === id);
    if (!found) {
      router.push('/transactions');
      return;
    }

    setTransaction(found);
  }, [id, router]);

  const handleExport = () => {
    if (!transaction) return;
    const items = transaction.items || [];
    const products: Product[] = getProducts();
    const discount = transaction.discount || 0;
    const additionalFee = transaction.additionalFee || 0;

    const calculateTotal = () => {
      let total = 0;
      items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          total += item.quantity * product.pricePerUnit;
        }
      });
      total -= discount;
      total += additionalFee;
      return total;
    };

    const doc = new jsPDF();
    doc.text(`Rozliczenie: ${id}`, 10, 10);
    doc.text(`Klient: ${transaction?.clientId ?? ''}`, 10, 20);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 10, 30);

    const rows = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const value = product ? item.quantity * product.pricePerUnit : 0;
      return [
        product?.name ?? '',
        item.quantity ?? '',
        product?.unit ?? '',
        product?.pricePerUnit !== undefined ? product.pricePerUnit.toFixed(2) : '',
        value !== undefined ? value.toFixed(2) : '',
      ];
    });

    rows.push(['', '', '', 'Rabat', `-${discount.toFixed(2)}`]);
    rows.push(['', '', '', 'Dopłata', `+${additionalFee.toFixed(2)}`]);
    rows.push(['', '', '', 'Suma', `${calculateTotal().toFixed(2)} zł`]);

    autoTable(doc, {
      startY: 50,
      head: [['Produkt', 'Ilość', 'Jednostka', 'Cena jedn.', 'Wartość']],
      body: rows,
    });

    doc.save(`rozliczenie-${id}.pdf`);
  }

  if (!transaction) return null;

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/20 dark:to-slate-900/20 shadow-2xl'>
        <CardContent className='space-y-6'>
          <div className='max-w-2xl mx-auto p-4'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <ReceiptText className='w-8 h-8 text-violet-600 dark:text-violet-300' />
                Przegląd rozliczenia
              </h1>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={handleExport} className='flex items-center gap-2 text-sm'>
                  <Download className='w-4 h-4' />
                  Eksportuj do PDF
                </Button>
                <Link href='/transactions'>
                  <Button variant='ghost' className='flex items-center gap-2 text-sm'>
                    <ArrowLeft className='w-4 h-4' />
                    Wróć
                  </Button>
                </Link>
              </div>
            </div>

            <TransactionForm
              editingTransaction={transaction}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
