import { Transaction, Product } from '@/types';
import { getProducts } from '@/utils/productStorage';
import { getClients } from '@/utils/clientStorage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export function handleExport(transaction: Transaction) {
  const productsList: Product[] = getProducts();
  const clients = getClients();
  const client = clients.find(c => c.id === transaction.clientId);
  const items = transaction.items || [];
  const discount = transaction.discount || 0;
  const additionalFee = transaction.additionalFee || 0;

  const now = new Date(transaction.date);
  const dateStr = now.toLocaleDateString('pl-PL');
  const timeStr = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const fileDateStr = now.toISOString().replace(/[:]/g, '-').slice(0, 16);

  const safeClientName = client?.name?.replace(/\s+/g, '_') || 'Nieznany';
  const filename = `${fileDateStr}_${safeClientName}.pdf`;

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  doc.setFont('Helvetica', 'normal');

  doc.text(text(`Rozliczenie - ${dateStr}, ${timeStr}`), 10, 10);
  if (client) {
    doc.text(text(`Klient: ${client.name}`), 10, 20);
    doc.text(text(`Adres: ${client.address || '-'}`), 10, 30);
    doc.text(text(`Telefon: ${client.phone || '-'}`), 10, 40);
  } else {
    doc.text(text(`Klient nie został odnaleziony w bazie.`), 10, 20);
  }

  const formatItems = (filterType: 'produkt' | 'usługa', excludeByName?: string) => {
    let subtotal = 0;

    const rows = items
      .map((item, index) => {
        const product = productsList.find(p => p.id === item.productId);
        if (!product || product.type !== filterType) return null;
        if (excludeByName && product.name.toLowerCase() === excludeByName.toLowerCase()) return null;

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

  const formatItemsTravel = () => {
    let subtotal = 0;

    const rows = items
      .map((item, index) => {
        const product = productsList.find(p => p.id === item.productId);
        if (!product || product.name.toLowerCase() !== 'dojazd') return null;

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

  const addSection = (title: string, data: string[][], subtotal: number, yOffset: number): number => {
    if (data.length === 0) return yOffset;

    doc.setFontSize(12);
    doc.text(text(title), 10, yOffset);
    yOffset += 4;

    autoTable(doc, {
      startY: yOffset,
      head: [['#', 'Pozycje', text('Ilość'), 'Jednostka', 'Cena jedn.', text('Wartość')]],
      body: data,
      foot: [
        [
          { content: '', colSpan: 4 },
          { content: `Suma ${title.toLowerCase()}`, styles: { fontStyle: 'bold' } },
          { content: subtotal.toFixed(2), styles: { fontStyle: 'bold' } },
        ],
      ],
      styles: { fontSize: 10, font: 'helvetica' },
      theme: 'striped',
      margin: { left: 10, right: 10 },
    });

    // @ts-expect-error: lastAutoTable is added by autoTable
    return doc.lastAutoTable.finalY + 8;
  };

  const travel = formatItemsTravel();
  const products = formatItems('produkt');
  const services = formatItems('usługa', 'Dojazd');

  let cursorY = 50;
  cursorY = addSection(text('Dojazd'), travel.rows, travel.subtotal, cursorY);
  cursorY = addSection(text('Produkty'), products.rows, products.subtotal, cursorY);
  cursorY = addSection(text('Usługi'), services.rows, services.subtotal, cursorY);

  const total = products.subtotal + services.subtotal + travel.subtotal - discount + additionalFee;

  const summary = [
    ['', '', '', '', text('Suma dojazdu'), travel.subtotal.toFixed(2)],
    ['', '', '', '', text('Suma produktów'), products.subtotal.toFixed(2)],
    ['', '', '', '', text('Suma usług'), services.subtotal.toFixed(2)],
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

  // @ts-expect-error: lastAutoTable is added by autoTable
  let finalY = doc.lastAutoTable.finalY + 10;

  if (transaction.description?.trim()) {
    doc.setFontSize(12);
    doc.text('Opis', 10, finalY);
    finalY += 6;

    const lines = doc.splitTextToSize(text(transaction.description), 190);
    doc.setFontSize(10);
    doc.text(lines, 10, finalY);
  }

  doc.save(filename);
}
