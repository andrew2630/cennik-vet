'use client';

import { useEffect, useState } from 'react';
import { getTransactions } from '@/utils/transactionStorage';
import { getClients } from '@/utils/clientStorage';
import { getProducts } from '@/utils/productStorage';
import { Transaction, Client, Product } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function exportToPDF() {
  const invoiceElement = document.getElementById('invoice-to-pdf');
  if (!invoiceElement) return;

  html2canvas(invoiceElement).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('faktura.pdf');
  });
}

export default function InvoiceView({ id }: { id: string }) {
  const [tx, setTx] = useState<Transaction | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const allTx = getTransactions();
    const found = allTx.find((t) => t.id === id);
    setTx(found || null);

    const allClients = getClients();
    const c = found ? allClients.find((cl) => cl.id === found.clientId) : null;
    setClient(c || null);

    setProducts(getProducts());
  }, [id]);

  if (!tx || !client) return <p>Nie znaleziono faktury.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Faktura</h1>
      <div className="mb-4">
        <strong>Klient:</strong> {client.name}<br />
        <strong>Data:</strong> {new Date(tx.date).toLocaleString('pl-PL')}
      </div>
      <ul className="mb-4">
        {tx.items.map((item, i) => {
          const product = products.find((p) => p.id === item.productId);
          return (
            <li key={i} className="mb-1">
              {product?.name || 'Produkt'} – {item.quantity} {product?.unit} × {product?.pricePerUnit} zł
            </li>
          );
        })}
      </ul>
      <div className="mb-2">Dojazd: {tx.distanceKm} km</div>
      <div className="mb-2">Dopłaty: {tx.isNight ? 'noc' : ''} {tx.isWeekend ? 'weekend' : ''}</div>
      <div className="mb-2">Ręczna korekta: {tx.manualAdjustment} zł</div>
      <div className="text-xl font-semibold">Suma: {tx.totalPrice.toFixed(2)} zł</div>
      <button onClick={exportToPDF} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Eksportuj PDF
      </button>
    </div>
  );
}
