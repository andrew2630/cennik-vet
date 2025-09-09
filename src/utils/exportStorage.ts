import { saveAs } from 'file-saver'
import pl from '@/public/locales/pl.json'
import en from '@/public/locales/en.json'
import { storageKey } from './userStorage'
import { Transaction } from '@/types'

export function exportAllDataToJSON() {
  const settings = JSON.parse(localStorage.getItem(storageKey('vet_settings')) || '{}')
  const data = {
    products: JSON.parse(localStorage.getItem(storageKey('vet_products')) || '[]'),
    clients: JSON.parse(localStorage.getItem(storageKey('vet_clients')) || '[]'),
    transactions: JSON.parse(localStorage.getItem(storageKey('vet_transactions')) || '[]').map(
      (t: Transaction) => ({ ...t, paymentMethod: t.paymentMethod ?? 'cash' }),
    ),
    exportedAt: new Date().toISOString(),
    settings,
  };

  const travelName = (settings.language === 'en' ? en : pl).itemType.travel.toLowerCase();

  type Product = { name?: string; unit?: string; [key: string]: unknown };
  data.products = (data.products as Product[]).map(p =>
    p.name && typeof p.name === 'string' && p.name.toLowerCase() === travelName
      ? { ...p, unit: settings.distanceUnit }
      : p
  );

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const filename = `cennik-vet-backup-${new Date().toISOString().slice(0, 10)}.json`;
  saveAs(blob, filename);
}
