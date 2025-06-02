'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { getClients } from '@/utils/clientStorage';
import Theme from '@/components/Theme';

function TransactionViewContent() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const from = searchParams.get('from');
  const backUrl = from === 'calendar' ? '/transactions/calendar' : '/transactions';
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.push(backUrl);
      return;
    }

    const all = getTransactions();
    const found = all.find(tx => tx.id === id);
    if (!found) {
      router.push(backUrl);
      return;
    }

    setTransaction(found);
  }, [id, router, backUrl]);

  const removeDiacritics = (str: string): string => {
    return str
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      .replace(/Ą/g, 'A')
      .replace(/Ć/g, 'C')
      .replace(/Ę/g, 'E')
      .replace(/Ł/g, 'L')
      .replace(/Ń/g, 'N')
      .replace(/Ó/g, 'O')
      .replace(/Ś/g, 'S')
      .replace(/Ź/g, 'Z')
      .replace(/Ż/g, 'Z');
  };

  const text = (txt: string) => removeDiacritics(txt);

  const handleExport = () => {
    if (!transaction) return;

    const productsList: Product[] = getProducts();
    const clients = getClients();
    const client = clients.find(c => c.id === transaction.clientId);
    const items = transaction.items || [];
    const discount = transaction.discount || 0;
    const additionalFee = transaction.additionalFee || 0;

    const now = new Date(transaction.date);
    const dateStr = now.toLocaleDateString('pl-PL');
    const timeStr = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const fileDateStr = now.toISOString().replace(/[:]/g, '-').slice(0, 16); // YYYY-MM-DDTHH-MM

    const safeClientName = client?.name?.replace(/\s+/g, '_') || 'Nieznany';
    const filename = `${fileDateStr}_${safeClientName}.pdf`;

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    doc.setFont('Helvetica', 'normal');

    doc.text(text(`Rozliczenie - ${dateStr}, ${timeStr}`), 10, 10);
    if (client) {
      doc.text(text(`Klient: ${client?.name || '-'}`), 10, 20);
      doc.text(text(`Adres: ${client.address || '-'}`), 10, 30);
      doc.text(text(`Telefon: ${client.phone || '-'}`), 10, 40);
    } else {
      doc.text(text(`Klient nie został odnaleziony w bazie.`), 10, 20);
    }

    const formatItems = (filterType: 'produkt' | 'usługa') => {
      let subtotal = 0;

      const rows = items
        .map((item, index) => {
          const product = productsList.find(p => p.id === item.productId);
          if (!product || product.type !== filterType) return null;

          const value = item.quantity * product.pricePerUnit;
          subtotal += value;

          return [
            `${index + 1}.`,
            text(product.name),
            item.quantity.toString(),
            text(product.unit),
            product.pricePerUnit.toFixed(2),
            value.toFixed(2),
          ];
        })
        .filter(Boolean) as string[][];

      return { rows, subtotal };
    };

    const addSection = (title: string, data: string[][], yOffset: number): number => {
      if (data.length === 0) return yOffset;

      doc.setFontSize(12);
      doc.text(text(title), 10, yOffset);
      yOffset += 4;

      autoTable(doc, {
        startY: yOffset,
        head: [['#', 'Produkt', text('Ilość'), text('Jednostka'), text('Cena jedn.'), text('Wartość')]],
        body: data,
        styles: { fontSize: 10, font: 'helvetica' },
        theme: 'striped',
        margin: { left: 10, right: 10 },
      });

      // @ts-expect-error: lastAutoTable is added by autoTable at runtime
      return doc.lastAutoTable.finalY + 8;
    };

    const produkty = formatItems('produkt');
    const uslugi = formatItems('usługa');

    let cursorY = 50;
    cursorY = addSection('Produkty', produkty.rows, cursorY);
    cursorY = addSection(text('Usługi'), uslugi.rows, cursorY);

    const total = produkty.subtotal + uslugi.subtotal - discount + additionalFee;

    const summary = [
      ['', '', '', '', text('Suma produktów'), produkty.subtotal.toFixed(2)],
      ['', '', '', '', text('Suma usług'), uslugi.subtotal.toFixed(2)],
      ['', '', '', '', text('Rabat'), `-${discount.toFixed(2)}`],
      ['', '', '', '', text('Dopłata'), `+${additionalFee.toFixed(2)}`],
      ['', '', '', '', text('SUMA KOŃCOWA'), text(`${total.toFixed(2)} zł`)],
    ];

    autoTable(doc, {
      startY: cursorY,
      body: summary,
      styles: { fontSize: 10, font: 'helvetica', halign: 'right' },
      theme: 'grid',
      margin: { left: 10, right: 10 },
    });

    doc.save(filename);
  };

  if (!transaction) return null;

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl'>
        <CardContent className='space-y-6'>
          <div className='max-w-2xl mx-auto p-4'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <ReceiptText className='w-8 h-8 text-violet-600 dark:text-violet-300' />
                Przegląd rozliczenia
              </h1>
              <div className='flex gap-2'>
                <Link href={backUrl}>
                  <Button variant='ghost' className='flex items-center gap-2 text-sm'>
                    <ArrowLeft className='w-4 h-4' />
                    Wróć
                  </Button>
                </Link>
              </div>
            </div>

            <TransactionForm editingTransaction={transaction} readOnly />
            <Button variant='outline' onClick={handleExport} className='flex items-center gap-2 text-sm p-4 mt-4'>
              <Download className='w-4 h-4' />
              Eksportuj do PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ViewTransactionPage() {
  return (
    <Theme>
      <Suspense>
        <TransactionViewContent />
      </Suspense>
    </Theme>
  );
}
