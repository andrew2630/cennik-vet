import { saveAs } from 'file-saver';

export function exportAllDataToJSON() {
  const data = {
    products: JSON.parse(localStorage.getItem('vet_products') || '[]'),
    clients: JSON.parse(localStorage.getItem('vet_clients') || '[]'),
    transactions: JSON.parse(localStorage.getItem('vet_transactions') || '[]'),
    settings: JSON.parse(localStorage.getItem('vet_settings') || '{}'),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `cennik-vet-backup-${new Date().toISOString().slice(0, 10)}.json`);
}
